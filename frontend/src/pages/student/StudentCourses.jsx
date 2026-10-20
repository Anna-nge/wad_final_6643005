import { useEffect, useState } from "react";
import { Alert, CircularProgress, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { apiFetch } from "../../lib/api";
import CourseCards from "../../components/CourseCards";

export default function StudentCourses() {
  const [query, setQuery] = useState("");
  const [courses, setCourses] = useState(null);
  const [error, setError] = useState("");

  // Server-side filter by part of course name or teacher name (debounced).
  useEffect(() => {
    const t = setTimeout(() => {
      const qs = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";
      apiFetch(`/api/course${qs}`)
        .then((data) => { setCourses(data); setError(""); })
        .catch((e) => setError(e.message));
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <Stack spacing={2}>
      <Typography variant="h4">All Courses</Typography>
      <TextField
        placeholder="Search by course name or teacher name"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }}
      />
      {error && <Alert severity="error">{error}</Alert>}
      {!courses ? <CircularProgress /> : courses.length === 0 ? (
        <Typography color="text.secondary">No courses found.</Typography>
      ) : (
        <CourseCards courses={courses} />
      )}
    </Stack>
  );
}
