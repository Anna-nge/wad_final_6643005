//src/app/api/auth/login/route.js

import bcrypt from "bcrypt";
import { getClientPromise } from "@/lib/mongodb";
import { cookieOptions, signJWT } from "@/lib/auth";
import { DB_NAME } from "@/lib/constant";
import {
  errorResponse,
  optionsResponse,
  printExceptionLog,
  successResponse,
} from "@/lib/utils";

export async function OPTIONS() {
  return optionsResponse();
}

// POST /api/auth/login  { username | email, password }
export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const login = String(body.username ?? body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!login || !password) {
      return errorResponse("Username/email and password are required", 400);
    }

    const client = await getClientPromise();
    const db = client.db(DB_NAME);
    const user = await db.collection("users").findOne({
      $or: [{ username: login }, { email: login }],
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return errorResponse("Invalid username/email or password", 401);
    }

    const token = signJWT(user);
    const response = successResponse(
      {
        message: "Login successful",
        token,
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
      200,
    );
    response.cookies.set("token", token, cookieOptions());
    return response;
  } catch (error) {
    printExceptionLog("POST /api/auth/login", error);
    return errorResponse("Internal server error", 500);
  }
}
