// src/components/Sidebar.tsx
import React from "react";
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ViewCarouselIcon from "@mui/icons-material/ViewCarousel";
import MenuIcon from "@mui/icons-material/Menu";
import PeopleIcon from "@mui/icons-material/People";
import WidgetsIcon from "@mui/icons-material/Widgets";
import ArticleIcon from "@mui/icons-material/Article";

type Props = {
  selectedModule: string;
  setSelectedModule: (m: string) => void;
  showNavbarInSidebar?: boolean;
};

export default function Sidebar({ selectedModule, setSelectedModule }: Props) {
  return (
    <Box sx={{ width: 240, bgcolor: "#17202a", color: "#fff", p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <MenuIcon />
        <Typography variant="h6">CMS</Typography>
      </Box>

      <List>
        <ListItemButton selected={selectedModule === "home"} onClick={() => setSelectedModule("home")}>
          <ListItemIcon><HomeIcon sx={{ color: "#f0a500" }} /></ListItemIcon>
          <ListItemText primary="Home" />
        </ListItemButton>

        <ListItemButton selected={selectedModule === "yourLayout"} onClick={() => setSelectedModule("yourLayout")}>
          <ListItemIcon><WidgetsIcon sx={{ color: "#fff" }} /></ListItemIcon>
          <ListItemText primary="Your Layout" />
        </ListItemButton>

        <ListItemButton selected={selectedModule === "carousel"} onClick={() => setSelectedModule("carousel")}>
          <ListItemIcon><ViewCarouselIcon sx={{ color: "#fff" }} /></ListItemIcon>
          <ListItemText primary="Carousels" />
        </ListItemButton>

        <ListItemButton selected={selectedModule === "testimonials"} onClick={() => setSelectedModule("testimonials")}>
          <ListItemIcon><PeopleIcon sx={{ color: "#fff" }} /></ListItemIcon>
          <ListItemText primary="Testimonials" />
        </ListItemButton>

        <ListItemButton selected={selectedModule === "navbar"} onClick={() => setSelectedModule("navbar")}>
          <ListItemIcon><ArticleIcon sx={{ color: "#fff" }} /></ListItemIcon>
          <ListItemText primary="Nav Builder" />
        </ListItemButton>
      </List>

      <Box sx={{ mt: 4, color: "#9aa7b2" }}>
        <Typography variant="caption">Selected: {selectedModule.toUpperCase()}</Typography>
      </Box>
    </Box>
  );
}
