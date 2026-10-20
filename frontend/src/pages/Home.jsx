import { Navigate } from "react-router-dom";
import useUser from "../context/useUser";

// Sends each role to its landing page.
export default function Home() {
  const { user } = useUser();
  return <Navigate to={user?.role === "Teacher" ? "/teacher/courses" : "/courses"} replace />;
}
