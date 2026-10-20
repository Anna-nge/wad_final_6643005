import { useEffect, useState } from "react";
import { Alert, CircularProgress, Stack, Typography } from "@mui/material";
import { apiFetch } from "../../lib/api";
import CourseCards from "../../components/CourseCards";

export default function MyCourses() {
  const [courses, setCourses] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/course?enrolled=true").then(setCourses).catch((e) => setError(e.message));
  }, []);

  return (
    <Stack spacing={2}>
      <Typography variant="h4">My Enrollments</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {!courses ? <CircularProgress /> : courses.length === 0 ? (
        <Typography color="text.secondary">You have not enrolled in any course yet.</Typography>
      ) : (
        <CourseCards courses={courses} />
      )}
    </Stack>
  );
}
