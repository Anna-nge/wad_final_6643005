import { useState } from "react";
import { Link as RouterLink, Navigate, useNavigate } from "react-router-dom";
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import useUser from "../context/useUser";

export default function Login() {
  const { user, login } = useUser();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(username.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "#f5f6fa", p: 2 }}>
      <Paper sx={{ p: 4, width: "100%", maxWidth: 400 }}>
        <Typography variant="h5" gutterBottom>Online Course Service</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Sign in with your username or email
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField label="Username or email" value={username} autoFocus required
              onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
            <TextField label="Password" type="password" value={password} required
              onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            <Button type="submit" variant="contained" size="large" disabled={busy}>
              {busy ? "Signing in..." : "Login"}
            </Button>
            <Typography variant="body2" textAlign="center">
              New here? <RouterLink to="/register">Create a student account</RouterLink>
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
