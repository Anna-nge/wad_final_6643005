//src/App.jsx

//src/App.jsx

import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import TeacherCourses from "./pages/teacher/TeacherCourses";
import CourseCreate from "./pages/teacher/CourseCreate";
import CourseEdit from "./pages/teacher/CourseEdit";
import TeacherCourseDetail from "./pages/teacher/TeacherCourseDetail";
import StudentCourses from "./pages/student/StudentCourses";
import StudentCourseDetail from "./pages/student/StudentCourseDetail";
import MyCourses from "./pages/student/MyCourses";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />

            <Route element={<ProtectedRoute roles={["Teacher"]} />}>
              <Route path="/teacher/courses" element={<TeacherCourses />} />
              <Route path="/teacher/courses/new" element={<CourseCreate />} />
              <Route path="/teacher/courses/:id" element={<TeacherCourseDetail />} />
              <Route path="/teacher/courses/:id/edit" element={<CourseEdit />} />
            </Route>

            <Route element={<ProtectedRoute roles={["Student"]} />}>
              <Route path="/courses" element={<StudentCourses />} />
              <Route path="/courses/:id" element={<StudentCourseDetail />} />
              <Route path="/my-courses" element={<MyCourses />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
