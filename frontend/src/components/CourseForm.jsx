import { useState } from "react";
import {
  Alert, Autocomplete, Box, Button, Chip, MenuItem, Paper, Stack, TextField, Typography,
} from "@mui/material";

const EMPTY = { name: "", duration: "", topics: [], price: "", maxStudent: "", status: "Open" };

// Shared create / edit form. `onSubmit(payload)` must return a promise.
export default function CourseForm({ initial, title, submitLabel, onSubmit, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const [topicInput, setTopicInput] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Include a topic still typed in the box but not yet confirmed with Enter.
    const topics = [...form.topics];
    if (topicInput.trim() && !topics.includes(topicInput.trim())) topics.push(topicInput.trim());
    if (topics.length === 0) return setError("Add at least one topic");

    setSaving(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        duration: Number(form.duration),
        topics,
        price: Number(form.price),
        maxStudent: Number(form.maxStudent),
        status: form.status,
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 640 }}>
      <Typography variant="h5" gutterBottom>{title}</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField label="Course name" value={form.name} onChange={set("name")} required />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField label="Duration (days)" type="number" value={form.duration}
              onChange={set("duration")} required slotProps={{ htmlInput: { min: 1, step: 1 } }} fullWidth />
            <TextField label="Price (THB)" type="number" value={form.price}
              onChange={set("price")} required slotProps={{ htmlInput: { min: 0, step: "any" } }} fullWidth />
            <TextField label="Max Student" type="number" value={form.maxStudent}
              onChange={set("maxStudent")} required slotProps={{ htmlInput: { min: 1, step: 1 } }} fullWidth />
          </Stack>
          <Autocomplete
            multiple freeSolo options={[]}
            value={form.topics}
            inputValue={topicInput}
            onInputChange={(_, v) => setTopicInput(v)}
            onChange={(_, v) => setForm({ ...form, topics: v.map((t) => t.trim()).filter(Boolean) })}
            renderValue={(value, getItemProps) =>
              value.map((option, index) => {
                const { key, ...itemProps } = getItemProps({ index });
                return <Chip key={key} label={option} size="small" {...itemProps} />;
              })
            }
            renderInput={(params) => (
              <TextField {...params} label="Topics" helperText="Type a topic and press Enter" />
            )}
          />
          <TextField select label="Status" value={form.status} onChange={set("status")}>
            {["Open", "Close", "Cancel"].map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
          <Stack direction="row" spacing={1}>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Saving..." : submitLabel}
            </Button>
            {onCancel && <Button onClick={onCancel}>Cancel</Button>}
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
}
