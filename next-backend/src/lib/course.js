// src/lib/course.js — shared course validation & serialization

import { COURSE_STATUS } from "./constant";

/**
 * Validate a course payload. With partial=true (update) only provided
 * fields are checked. Returns { data, error }.
 */
export function validateCourse(body, partial = false) {
  const data = {};
  const has = (k) => body[k] !== undefined;

  if (!partial || has("name")) {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) return { error: "Course name is required" };
    data.name = name;
  }

  if (!partial || has("duration")) {
    const duration = Number(body.duration);
    if (!Number.isInteger(duration) || duration < 1)
      return { error: "Duration must be a whole number of days (>= 1)" };
    data.duration = duration;
  }

  if (!partial || has("topics")) {
    let topics = body.topics;
    if (typeof topics === "string") topics = topics.split(",");
    if (!Array.isArray(topics)) return { error: "Topics must be a list" };
    topics = topics.map((t) => String(t).trim()).filter(Boolean);
    if (topics.length === 0) return { error: "At least one topic is required" };
    data.topics = [...new Set(topics)];
  }

  if (!partial || has("price")) {
    const price = Number(body.price);
    if (body.price === "" || !Number.isFinite(price) || price < 0)
      return { error: "Price must be a number >= 0" };
    data.price = price;
  }

  if (!partial || has("maxStudent")) {
    const maxStudent = Number(body.maxStudent);
    if (!Number.isInteger(maxStudent) || maxStudent < 1)
      return { error: "Max Student must be a whole number (>= 1)" };
    data.maxStudent = maxStudent;
  }

  if (!partial || has("status")) {
    const status = body.status ?? (partial ? undefined : "Open");
    if (!COURSE_STATUS.includes(status))
      return { error: `Status must be one of ${COURSE_STATUS.join(", ")}` };
    data.status = status;
  }

  return { data };
}

/** Convert a course document to JSON for the API. */
export function serializeCourse(course, viewer) {
  const enrollments = course.enrollments || [];
  const enrolledCount = enrollments.length;
  const out = {
    id: course._id.toString(),
    name: course.name,
    duration: course.duration,
    topics: course.topics,
    price: course.price,
    maxStudent: course.maxStudent,
    status: course.status,
    teacherId: course.teacherId.toString(),
    teacherName: course.teacherName,
    enrolledCount,
    seatsLeft: Math.max(course.maxStudent - enrolledCount, 0),
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  };

  if (viewer?.role === "Student") {
    out.isEnrolled = enrollments.some(
      (e) => e.studentId.toString() === viewer.id,
    );
    out.canEnroll =
      course.status === "Open" && out.seatsLeft > 0 && !out.isEnrolled;
  }

  // Only the owning teacher sees who is enrolled.
  if (viewer?.role === "Teacher" && viewer.id === out.teacherId) {
    out.enrolledStudents = enrollments.map((e) => ({
      id: e.studentId.toString(),
      username: e.username,
      email: e.email,
      enrolledAt: e.enrolledAt,
    }));
  }

  return out;
}
