import { Box, Chip, Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import StatusChip from "./StatusChip";

// Read-only course summary used by both teacher and student detail pages.
export default function CourseInfo({ course, children }) {
  const rows = [
    ["Teacher", course.teacherName],
    ["Duration", `${course.duration} day(s)`],
    ["Price", `${Number(course.price).toLocaleString()} THB`],
    ["Seats", `${course.enrolledCount} / ${course.maxStudent} enrolled (${course.seatsLeft} left)`],
  ];
  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 2 }}>
        <Typography variant="h4">{course.name}</Typography>
        <StatusChip status={course.status} />
      </Stack>
      <Grid container spacing={2}>
        {rows.map(([label, value]) => (
          <Grid key={label} size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
            <Typography>{value}</Typography>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">Topics</Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mt: 0.5, rowGap: 1 }}>
          {course.topics.map((t) => <Chip key={t} label={t} variant="outlined" size="small" />)}
        </Stack>
      </Box>
      {children && <><Divider sx={{ my: 2 }} />{children}</>}
    </Paper>
  );
}
