import { Box, CircularProgress } from "@mui/material";

export default function Loading({ size = "normal" }: { size?: "normal" | "small" }) {
  return (
    <Box m={size === "normal" ? 5 : 1} display="flex" justifyContent="center">
      <CircularProgress size={size === "normal" ? 40 : 20} />
    </Box>
  );
}
