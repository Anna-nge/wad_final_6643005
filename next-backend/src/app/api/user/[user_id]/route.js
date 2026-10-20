//src/app/api/user/[user_id]/route.js

import { ObjectId } from "mongodb";
import { getClientPromise } from "@/lib/mongodb";
import { getRequestUser } from "@/lib/auth";
import { DB_NAME } from "@/lib/constant";
import {
  errorResponse,
  isValidObjectId,
  optionsResponse,
  printExceptionLog,
  successResponse,
} from "@/lib/utils";

export async function OPTIONS() {
  return optionsResponse();
}

// GET /api/user/:user_id — a user may only read their own profile
export async function GET(req, { params }) {
  try {
    const { user_id } = await params;
    const me = getRequestUser(req);

    if (!me) return errorResponse("Unauthorized Request", 401);
    if (!isValidObjectId(user_id)) return errorResponse("Invalid user id", 400);
    if (user_id !== me.id) return errorResponse("Forbidden", 403);

    const client = await getClientPromise();
    const user = await client
      .db(DB_NAME)
      .collection("users")
      .findOne({ _id: new ObjectId(user_id) }, { projection: { password: 0 } });

    if (!user) return errorResponse("User not found", 404);

    return successResponse(
      {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      },
      200,
    );
  } catch (error) {
    printExceptionLog("GET /api/user/[user_id]", error);
    return errorResponse("Internal server error", 500);
  }
}
