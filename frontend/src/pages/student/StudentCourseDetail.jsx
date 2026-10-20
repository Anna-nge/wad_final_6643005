import { useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { Alert, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { apiFetch } from "../../lib/api";
import CourseInfo from "../../components/CourseInfo";

export default function StudentCourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    apiFetch(`/api/course/${id}`).then(setCourse).catch((e) => setError(e.message));
  }, [id]);

  async function handleEnroll() {
    setBusy(true);
    setError("");
    try {
      const data = await apiFetch(`/api/course/${id}/enroll`, { method: "POST" });
      setCourse(data.course);
      setMessage("You are now enrolled in this course!");
    } catch (e) {
      setError(e.message);
      // Refresh so seats/status reflect the latest state.
      apiFetch(`/api/course/${id}`).then(setCourse).catch(() => {});
    } finally {
      setBusy(false);
    }
  }

  if (!course) return error ? <Alert severity="error">{error}</Alert> : <CircularProgress />;

  let reason = "";
  if (course.isEnrolled) reason = "You are enrolled in this course.";
  else if (course.status !== "Open") reason = `This course is ${course.status === "Close" ? "closed" : "cancelled"} for enrollment.`;
  else if (course.seatsLeft <= 0) reason = "This course is full.";

  return (
    <Stack spacing={2}>
      <div><Button component={RouterLink} to="/courses">← Back to courses</Button></div>
      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      <CourseInfo course={course}>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Button variant="contained" size="large" onClick={handleEnroll}
            disabled={!course.canEnroll || busy}>
            {busy ? "Enrolling..." : course.isEnrolled ? "Enrolled" : "Enroll"}
          </Button>
          {reason && <Typography color="text.secondary">{reason}</Typography>}
        </Stack>
      </CourseInfo>
    </Stack>
  );
}
