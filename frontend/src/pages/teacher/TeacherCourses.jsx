import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Alert, Button, Paper, Stack, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import { apiFetch } from "../../lib/api";
import StatusChip from "../../components/StatusChip";

const columns = [
  { field: "name", headerName: "Course name", flex: 1, minWidth: 180 },
  { field: "duration", headerName: "Days", width: 80, type: "number" },
  { field: "topics", headerName: "Topics", flex: 1, minWidth: 160, valueGetter: (v) => v.join(", ") },
  { field: "price", headerName: "Price", width: 100, type: "number" },
  {
    field: "seats", headerName: "Enrolled", width: 100,
    valueGetter: (_, row) => `${row.enrolledCount} / ${row.maxStudent}`,
  },
  { field: "status", headerName: "Status", width: 100, renderCell: (p) => <StatusChip status={p.value} /> },
];

export default function TeacherCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/course")
      .then(setCourses)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h4">My Courses</Typography>
        <Button variant="contained" startIcon={<AddIcon />} component={RouterLink} to="/teacher/courses/new">
          New Course
        </Button>
      </Stack>
      {error && <Alert severity="error">{error}</Alert>}
      <Paper>
        <DataGrid
          rows={courses}
          columns={columns}
          loading={loading}
          autoHeight
          disableRowSelectionOnClick
          onRowClick={(p) => navigate(`/teacher/courses/${p.id}`)}
          sx={{ "& .MuiDataGrid-row": { cursor: "pointer" } }}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25]}
          localeText={{ noRowsLabel: "No courses yet — create one!" }}
        />
      </Paper>
    </Stack>
  );
}
