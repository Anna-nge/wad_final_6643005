//src/app/api/user/route.js

import { ObjectId } from "mongodb";
import { getClientPromise } from "@/lib/mongodb";
import { getRequestUser } from "@/lib/auth";
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

// GET /api/user — profile of the logged-in user (used to restore a session)
export async function GET(req) {
  try {
    const me = getRequestUser(req);
    if (!me) return errorResponse("Unauthorized Request", 401);

    const client = await getClientPromise();
    const user = await client
      .db(DB_NAME)
      .collection("users")
      .findOne({ _id: new ObjectId(me.id) }, { projection: { password: 0 } });

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
    printExceptionLog("GET /api/user", error);
    return errorResponse("Internal server error", 500);
  }
}
