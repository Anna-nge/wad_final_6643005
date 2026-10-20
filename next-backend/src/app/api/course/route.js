//src/app/api/course/route.js

import { ObjectId } from "mongodb";
import { getClientPromise } from "@/lib/mongodb";
import { getRequestUser } from "@/lib/auth";
import { DB_NAME, ROLE_STUDENT, ROLE_TEACHER } from "@/lib/constant";
import { serializeCourse, validateCourse } from "@/lib/course";
import {
  errorResponse,
  escapeRegex,
  optionsResponse,
  printExceptionLog,
  successResponse,
} from "@/lib/utils";

export async function OPTIONS() {
  return optionsResponse();
}

/**
 * GET /api/course
 *  Teacher: own courses only.
 *  Student: all courses except "Cancel".
 *     ?q=<text>        filter by part of course name OR teacher name
 *     ?enrolled=true   only courses the student is enrolled in
 */
export async function GET(req) {
  try {
    const me = getRequestUser(req);
    const { searchParams } = new URL(req.url);
    const db = (await getClientPromise()).db(DB_NAME);

    let filter;
    if (me.role === ROLE_TEACHER) {
      filter = { teacherId: new ObjectId(me.id) };
    } else if (me.role === ROLE_STUDENT) {
      filter = {};
      if (searchParams.get("enrolled") !== "true") {
        filter.status = { $ne: "Cancel" };
      }
      const q = (searchParams.get("q") || "").trim();
      if (q) {
        const rx = { $regex: escapeRegex(q), $options: "i" };
        filter.$or = [{ name: rx }, { teacherName: rx }];
      }
      if (searchParams.get("enrolled") === "true") {
        filter["enrollments.studentId"] = new ObjectId(me.id);
      }
    } else {
      return errorResponse("Forbidden", 403);
    }

    const courses = await db
      .collection("courses")
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return successResponse(
      courses.map((c) => serializeCourse(c, me)),
      200,
    );
  } catch (error) {
    printExceptionLog("GET /api/course", error);
    return errorResponse("Internal server error", 500);
  }
}

// POST /api/course — Teacher only
export async function POST(req) {
  try {
    const me = getRequestUser(req);
    if (me.role !== ROLE_TEACHER)
      return errorResponse("Only teachers can create courses", 403);

    const body = await req.json().catch(() => null);
    if (!body) return errorResponse("Invalid JSON body", 400);

    const { data, error } = validateCourse(body);
    if (error) return errorResponse(error, 400);

    const now = new Date();
    const doc = {
      ...data,
      teacherId: new ObjectId(me.id),
      teacherName: me.username,
      enrollments: [],
      createdAt: now,
      updatedAt: now,
    };

    const db = (await getClientPromise()).db(DB_NAME);
    const result = await db.collection("courses").insertOne(doc);
    doc._id = result.insertedId;

    return successResponse(serializeCourse(doc, me), 201);
  } catch (error) {
    printExceptionLog("POST /api/course", error);
    return errorResponse("Internal server error", 500);
  }
}
