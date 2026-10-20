import bcrypt from "bcrypt";
import { getClientPromise } from "@/lib/mongodb";
import { cookieOptions, signJWT } from "@/lib/auth";
import { DB_NAME, ROLE_STUDENT } from "@/lib/constant";
import {
  errorResponse,
  optionsResponse,
  printExceptionLog,
  successResponse,
} from "@/lib/utils";

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const username = String(body.username ?? "").trim().toLowerCase();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      return errorResponse("Username must be 3–30 characters (letters, numbers, underscores)", 400);
    }
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return errorResponse("Enter a valid email address", 400);
    }
    if (password.length < 8 || password.length > 72) {
      return errorResponse("Password must be between 8 and 72 characters", 400);
    }

    const db = (await getClientPromise()).db(DB_NAME);
    const users = db.collection("users");
    await users.createIndex({ username: 1 }, { unique: true });
    await users.createIndex({ email: 1 }, { unique: true });
    const existing = await users.findOne({
      $or: [{ username }, { email }],
    });
    if (existing) {
      return errorResponse("That username or email is already registered", 409);
    }

    const user = {
      username,
      email,
      password: await bcrypt.hash(password, 12),
      role: ROLE_STUDENT,
      createdAt: new Date(),
    };
    let result;
    try {
      result = await users.insertOne(user);
    } catch (error) {
      if (error.code === 11000) {
        return errorResponse("That username or email is already registered", 409);
      }
      throw error;
    }
    user._id = result.insertedId;

    const token = signJWT(user);
    const response = successResponse(
      {
        message: "Account created",
        token,
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
      201,
    );
    response.cookies.set("token", token, cookieOptions());
    return response;
  } catch (error) {
    printExceptionLog("POST /api/auth/register", error);
    return errorResponse("Internal server error", 500);
  }
}
