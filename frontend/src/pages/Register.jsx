import { useState } from "react";
import { Link as RouterLink, Navigate, useNavigate } from "react-router-dom";
import { Alert, Box, Button, Link, Paper, Stack, TextField, Typography } from "@mui/material";
import useUser from "../context/useUser";

export default function Register() {
  const { user, register } = useUser();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setBusy(true);
    try {
      await register(username.trim(), email.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "#f5f6fa", p: 2 }}>
      <Paper sx={{ p: 4, width: "100%", maxWidth: 440 }}>
        <Typography variant="h5" gutterBottom>Create your student account</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Sign up to browse and enroll in courses.
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              inputProps={{ minLength: 3, maxLength: 30, pattern: "[A-Za-z0-9_]+" }}
              helperText="3–30 letters, numbers, or underscores"
              required
              autoFocus
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              inputProps={{ minLength: 8, maxLength: 72 }}
              helperText="At least 8 characters"
              required
            />
            <TextField
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
            <Button type="submit" variant="contained" size="large" disabled={busy}>
              {busy ? "Creating account…" : "Create account"}
            </Button>
            <Typography variant="body2" textAlign="center">
              Already registered? <Link component={RouterLink} to="/login">Sign in</Link>
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
