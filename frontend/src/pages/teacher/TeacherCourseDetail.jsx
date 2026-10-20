import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import {
  Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  Stack, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { apiFetch } from "../../lib/api";
import CourseInfo from "../../components/CourseInfo";

export default function TeacherCourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    apiFetch(`/api/course/${id}`).then(setCourse).catch((e) => setError(e.message));
  }, [id]);

  async function handleDelete() {
    setConfirmOpen(false);
    try {
      await apiFetch(`/api/course/${id}`, { method: "DELETE" });
      navigate("/teacher/courses");
    } catch (e) {
      setError(e.message);
    }
  }

  if (!course) return error ? <Alert severity="error">{error}</Alert> : <CircularProgress />;

  const students = course.enrolledStudents || [];
  const canDelete = students.length === 0;

  return (
    <Stack spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}
      <Stack direction="row" spacing={1}>
        <Button component={RouterLink} to="/teacher/courses">← Back</Button>
        <Button variant="contained" startIcon={<EditIcon />} component={RouterLink} to={`/teacher/courses/${id}/edit`}>
          Edit
        </Button>
        <Tooltip title={canDelete ? "" : "Courses with enrolled students cannot be deleted"}>
          <span>
            <Button color="error" variant="outlined" startIcon={<DeleteIcon />}
              disabled={!canDelete} onClick={() => setConfirmOpen(true)}>
              Delete
            </Button>
          </span>
        </Tooltip>
      </Stack>

      <CourseInfo course={course}>
        <Typography variant="h6" gutterBottom>Enrolled Students ({students.length})</Typography>
        {students.length === 0 ? (
          <Typography color="text.secondary">No students enrolled yet.</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Enrolled at</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((s, i) => (
                <TableRow key={s.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{s.username}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>{new Date(s.enrolledAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CourseInfo>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Delete course?</DialogTitle>
        <DialogContent>“{course.name}” will be permanently deleted.</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
