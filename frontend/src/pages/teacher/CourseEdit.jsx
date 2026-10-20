import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, CircularProgress } from "@mui/material";
import CourseForm from "../../components/CourseForm";
import { apiFetch } from "../../lib/api";

export default function CourseEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch(`/api/course/${id}`).then(setCourse).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!course) return <CircularProgress />;

  async function handleSubmit(payload) {
    await apiFetch(`/api/course/${id}`, { method: "PUT", body: payload });
    navigate(`/teacher/courses/${id}`);
  }

  return (
    <CourseForm
      title={`Edit: ${course.name}`}
      submitLabel="Save changes"
      initial={{
        name: course.name, duration: course.duration, topics: course.topics,
        price: course.price, maxStudent: course.maxStudent, status: course.status,
      }}
      onSubmit={handleSubmit}
      onCancel={() => navigate(`/teacher/courses/${id}`)}
    />
  );
}
