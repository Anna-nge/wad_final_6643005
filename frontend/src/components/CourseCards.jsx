import { Link as RouterLink } from "react-router-dom";
import { Card, CardActionArea, CardContent, Chip, Grid, Stack, Typography } from "@mui/material";
import StatusChip from "./StatusChip";

// Grid of course cards for the student views.
export default function CourseCards({ courses }) {
  return (
    <Grid container spacing={2}>
      {courses.map((c) => (
        <Grid key={c.id} size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardActionArea component={RouterLink} to={`/courses/${c.id}`} sx={{ height: "100%" }}>
              <CardContent>
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "start", gap: 1 }}>
                  <Typography variant="h6">{c.name}</Typography>
                  <StatusChip status={c.status} />
                </Stack>
                <Typography variant="body2" color="text.secondary">by {c.teacherName}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {c.duration} day(s) · {Number(c.price).toLocaleString()} THB
                </Typography>
                <Typography variant="body2">
                  Seats left: {c.seatsLeft} / {c.maxStudent}
                </Typography>
                {c.isEnrolled && <Chip label="Enrolled" color="primary" size="small" sx={{ mt: 1 }} />}
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
