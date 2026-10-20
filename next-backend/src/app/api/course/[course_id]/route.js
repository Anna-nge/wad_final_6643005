//src/app/api/course/[course_id]/route.js

import { ObjectId } from "mongodb";
import { getClientPromise } from "@/lib/mongodb";
import { getRequestUser } from "@/lib/auth";
import { DB_NAME, ROLE_STUDENT, ROLE_TEACHER } from "@/lib/constant";
import { serializeCourse, validateCourse } from "@/lib/course";
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

async function loadCourse(params) {
  const { course_id } = await params;
  if (!isValidObjectId(course_id)) return { error: errorResponse("Invalid course id", 400) };
  const db = (await getClientPromise()).db(DB_NAME);
  const course = await db
    .collection("courses")
    .findOne({ _id: new ObjectId(course_id) });
  if (!course) return { error: errorResponse("Course not found", 404) };
  return { db, course };
}

const isOwner = (course, me) =>
  me.role === ROLE_TEACHER && course.teacherId.toString() === me.id;

/**
 * GET /api/course/:id
 *  Teacher: only their own course (includes enrolled students).
 *  Student: any course that is not "Cancel" (unless already enrolled in it).
 */
export async function GET(req, { params }) {
  try {
    const me = getRequestUser(req);
    const { course, error } = await loadCourse(params);
    if (error) return error;

    if (me.role === ROLE_TEACHER) {
      if (!isOwner(course, me))
        return errorResponse("You can only view your own courses", 403);
    } else if (me.role === ROLE_STUDENT) {
      const enrolled = (course.enrollments || []).some(
        (e) => e.studentId.toString() === me.id,
      );
      if (course.status === "Cancel" && !enrolled)
        return errorResponse("Course not found", 404);
    } else {
      return errorResponse("Forbidden", 403);
    }

    return successResponse(serializeCourse(course, me), 200);
  } catch (error) {
    printExceptionLog("GET /api/course/[course_id]", error);
    return errorResponse("Internal server error", 500);
  }
}

// PUT /api/course/:id — owner Teacher only (partial updates allowed)
export async function PUT(req, { params }) {
  try {
    const me = getRequestUser(req);
    if (me.role !== ROLE_TEACHER)
      return errorResponse("Only teachers can update courses", 403);

    const { db, course, error } = await loadCourse(params);
    if (error) return error;
    if (!isOwner(course, me))
      return errorResponse("You can only update your own courses", 403);

    const body = await req.json().catch(() => null);
    if (!body) return errorResponse("Invalid JSON body", 400);

    const { data, error: vError } = validateCourse(body, true);
    if (vError) return errorResponse(vError, 400);
    if (Object.keys(data).length === 0)
      return errorResponse("No fields to update", 400);

    const enrolledCount = (course.enrollments || []).length;
    if (data.maxStudent !== undefined && data.maxStudent < enrolledCount) {
      return errorResponse(
        `Max Student cannot be less than the ${enrolledCount} students already enrolled`,
        400,
      );
    }

    data.updatedAt = new Date();
    const updated = await db.collection("courses").findOneAndUpdate(
      { _id: course._id, teacherId: new ObjectId(me.id) },
      { $set: data },
      { returnDocument: "after" },
    );

    return successResponse(serializeCourse(updated, me), 200);
  } catch (error) {
    printExceptionLog("PUT /api/course/[course_id]", error);
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/course/:id — owner Teacher only, and only with no enrollments
export async function DELETE(req, { params }) {
  try {
    const me = getRequestUser(req);
    if (me.role !== ROLE_TEACHER)
      return errorResponse("Only teachers can delete courses", 403);

    const { db, course, error } = await loadCourse(params);
    if (error) return error;
    if (!isOwner(course, me))
      return errorResponse("You can only delete your own courses", 403);

    // Atomic: only deletes if the enrollment list is still empty.
    const result = await db.collection("courses").deleteOne({
      _id: course._id,
      teacherId: new ObjectId(me.id),
      $or: [{ enrollments: { $size: 0 } }, { enrollments: { $exists: false } }],
    });

    if (result.deletedCount === 0) {
      return errorResponse(
        "Cannot delete a course that already has enrolled students",
        409,
      );
    }

    return successResponse({ message: "Course deleted" }, 200);
  } catch (error) {
    printExceptionLog("DELETE /api/course/[course_id]", error);
    return errorResponse("Internal server error", 500);
  }
}
