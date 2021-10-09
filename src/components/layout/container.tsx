import { ReactNode } from "react";

import { Container as MuiContainer, Typography } from "@mui/material";

export const Container = ({ title = undefined, children = undefined as ReactNode }) => (
  <MuiContainer sx={{ my: 5 }}>
    {title && (
      <Typography variant="h2" sx={{ mb: 4 }}>
        {title}
      </Typography>
    )}
    {children}
  </MuiContainer>
);
