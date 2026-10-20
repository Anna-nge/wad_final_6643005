//src/app/api/course/[course_id]/enroll/route.js

import { ObjectId } from "mongodb";
import { getClientPromise } from "@/lib/mongodb";
import { getRequestUser } from "@/lib/auth";
import { DB_NAME, ROLE_STUDENT } from "@/lib/constant";
import { serializeCourse } from "@/lib/course";
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

// POST /api/course/:id/enroll — Student only
export async function POST(req, { params }) {
  try {
    const me = getRequestUser(req);
    if (me.role !== ROLE_STUDENT)
      return errorResponse("Only students can enroll in courses", 403);

    const { course_id } = await params;
    if (!isValidObjectId(course_id)) return errorResponse("Invalid course id", 400);

    const db = (await getClientPromise()).db(DB_NAME);
    const courses = db.collection("courses");
    const courseId = new ObjectId(course_id);
    const studentId = new ObjectId(me.id);

    // Single atomic update: status Open, seats left, not already enrolled.
    // Prevents overbooking and double enrollment under concurrent requests.
    const updated = await courses.findOneAndUpdate(
      {
        _id: courseId,
        status: "Open",
        "enrollments.studentId": { $ne: studentId },
        $expr: { $lt: [{ $size: { $ifNull: ["$enrollments", []] } }, "$maxStudent"] },
      },
      {
        $push: {
          enrollments: {
            studentId,
            username: me.username,
            email: me.email,
            enrolledAt: new Date(),
          },
        },
      },
      { returnDocument: "after" },
    );

    if (updated) {
      return successResponse(
        { message: "Enrolled successfully", course: serializeCourse(updated, me) },
        201,
      );
    }

    // Work out why it failed, for a clear error message.
    const course = await courses.findOne({ _id: courseId });
    if (!course || course.status === "Cancel")
      return errorResponse("Course not found", 404);
    if ((course.enrollments || []).some((e) => e.studentId.equals(studentId)))
      return errorResponse("You are already enrolled in this course", 409);
    if (course.status !== "Open")
      return errorResponse("This course is not open for enrollment", 400);
    return errorResponse("This course is full", 409);
  } catch (error) {
    printExceptionLog("POST /api/course/[course_id]/enroll", error);
    return errorResponse("Internal server error", 500);
  }
}
