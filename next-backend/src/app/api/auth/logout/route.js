//src/app/api/auth/logout/route.js

import { cookieOptions } from "@/lib/auth";
import { optionsResponse, successResponse } from "@/lib/utils";

export async function OPTIONS() {
  return optionsResponse();
}

// POST /api/auth/logout — clears the auth cookie
export async function POST() {
  const response = successResponse({ message: "Logout successful" }, 200);
  response.cookies.set("token", "", cookieOptions(0));
  return response;
}
