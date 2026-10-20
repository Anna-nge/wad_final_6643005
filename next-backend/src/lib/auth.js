import jwt from "jsonwebtoken";
import {
  X_HEADER_USER_EMAIL,
  X_HEADER_USER_ID,
  X_HEADER_USER_NAME,
  X_HEADER_USER_ROLE,
} from "./constant";

const JWT_SECRET = process.env.JWT_SECRET;
export const TOKEN_MAX_AGE = 60 * 60 * 24; // 1 day (seconds)

export function signJWT(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_MAX_AGE },
  );
}

export function verifyJWT(req) {
  try {
    // Cookie first (httpOnly), then "Authorization: Bearer <token>" as fallback
    // for browsers that block cross-site cookies.
    let token = req.cookies.get("token")?.value;
    if (!token) {
      const authHeader = req.headers.get("authorization") || "";
      if (authHeader.startsWith("Bearer ")) token = authHeader.slice(7);
    }

    if (!token) {
      return null;
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    console.log(err.message);
    return null;
  }
}

// Read the authenticated user that proxy.js attached to the request headers.
export function getRequestUser(req) {
  const id = req.headers.get(X_HEADER_USER_ID);
  if (!id) return null;
  return {
    id,
    email: req.headers.get(X_HEADER_USER_EMAIL),
    username: req.headers.get(X_HEADER_USER_NAME),
    role: req.headers.get(X_HEADER_USER_ROLE),
  };
}

export function cookieOptions(maxAge = TOKEN_MAX_AGE) {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    // Frontend and backend live on different domains in production,
    // so the cookie must be SameSite=None (which requires Secure).
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge,
  };
}
