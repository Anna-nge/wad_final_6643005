// src/lib/api.js — small fetch wrapper used by every page

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const TOKEN_KEY = "token";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// Listeners notified on 401 so the app can log the user out.
const unauthorizedListeners = new Set();
export function onUnauthorized(fn) {
  unauthorizedListeners.add(fn);
  return () => unauthorizedListeners.delete(fn);
}

export async function apiFetch(path, { method = "GET", body, headers } = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include", // send the httpOnly auth cookie
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }

  if (!res.ok) {
    if (res.status === 401 && !path.startsWith("/api/auth/")) {
      unauthorizedListeners.forEach((fn) => fn());
    }
    throw new ApiError(data?.message || `Request failed (${res.status})`, res.status);
  }
  return data;
}
