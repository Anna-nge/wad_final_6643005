//src/context/UseContext.jsx

import { createContext, useEffect, useRef, useState } from "react";
import { apiFetch, getToken, onUnauthorized, setToken } from "../lib/api";

const API_URL = import.meta.env.VITE_API_URL;

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const restored = useRef(false); // avoid double restore in StrictMode

  // Restore the session on page load (cookie or stored token).
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;

    if (!API_URL) console.warn("VITE_API_URL is not set");

    apiFetch("/api/user")
      .then((me) => setUser(me))
      .catch(() => {
        setUser(null);
        if (getToken()) setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Any 401 from the API means the session expired.
  useEffect(
    () =>
      onUnauthorized(() => {
        setToken(null);
        setUser(null);
      }),
    [],
  );

  async function login(username, password) {
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: { username, password },
    });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(username, email, password) {
    const data = await apiFetch("/api/auth/register", {
      method: "POST",
      body: { username, email, password },
    });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      setToken(null);
      setUser(null);
    }
  }

  return (
    <UserContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </UserContext.Provider>
  );
}
