import { useNavigate } from "react-router-dom";
import CourseForm from "../../components/CourseForm";
import { apiFetch } from "../../lib/api";

export default function CourseCreate() {
  const navigate = useNavigate();

  async function handleSubmit(payload) {
    const course = await apiFetch("/api/course", { method: "POST", body: payload });
    navigate(`/teacher/courses/${course.id}`);
  }

  return (
    <CourseForm title="Create Course" submitLabel="Create"
      onSubmit={handleSubmit} onCancel={() => navigate("/teacher/courses")} />
  );
}
