import { Link as RouterLink, Outlet, useNavigate } from "react-router-dom";
import { AppBar, Box, Button, Chip, Container, Toolbar, Typography } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import useUser from "../context/useUser";

export default function Layout() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const links =
    user?.role === "Teacher"
      ? [
          { to: "/teacher/courses", label: "My Courses" },
          { to: "/teacher/courses/new", label: "New Course" },
        ]
      : [
          { to: "/courses", label: "All Courses" },
          { to: "/my-courses", label: "My Enrollments" },
        ];

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f6fa" }}>
      <AppBar position="static">
        <Toolbar sx={{ gap: 1, flexWrap: "wrap" }}>
          <SchoolIcon />
          <Typography variant="h6" sx={{ mr: 2 }}>
            Online Course Service
          </Typography>
          {links.map((l) => (
            <Button key={l.to} color="inherit" component={RouterLink} to={l.to}>
              {l.label}
            </Button>
          ))}
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body2">{user?.username}</Typography>
          <Chip size="small" label={user?.role} sx={{ bgcolor: "white" }} />
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
