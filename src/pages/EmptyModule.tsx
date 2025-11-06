// src/pages/EmptyModule.tsx
import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { PageProps } from "../types/routes";

const EmptyModule: React.FC<PageProps> = ({ moduleName = "This module" }) => (
  <Box sx={{ p: { xs: 2, md: 6 }, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f5f7f8" }}>
    <Paper elevation={3} sx={{ p: { xs: 3, md: 6 }, borderRadius: 2, textAlign: "center", maxWidth: 720 }}>
      <Typography variant="h4" sx={{ color: "#2c3e50", fontWeight: 700, mb: 1 }}>
        {moduleName} — Coming Soon
      </Typography>
      <Typography variant="body1" sx={{ color: "#67757f" }}>
        We're working on this feature. Meanwhile use the Navbar Builder to design and preview navbars.
      </Typography>
    </Paper>
  </Box>
);

export default EmptyModule;
