import { Navigate, Outlet } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import useUser from "../context/useUser";

// Guards routes: must be logged in, and (optionally) have one of `roles`.
export default function ProtectedRoute({ roles }) {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
