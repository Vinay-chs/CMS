//src/components/Sidebar.tsx
import React from "react";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography
} from "@mui/material";
import { SidebarProps } from "../types/routes";
import HomeIcon from "@mui/icons-material/Home";
import ViewQuilt from "@mui/icons-material/ViewQuilt";
import MenuIcon from "@mui/icons-material/Menu";

const Sidebar: React.FC<SidebarProps> = ({ selectedModule, setSelectedModule, showNavbarInSidebar = false }) => {
  return (
    <Box sx={{ width: 260, bgcolor: "#17202a", color: "#ecf0f1", height: "100%", p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: "#f7c948" }}>
        CMS
      </Typography>

      <List>
        {/* Home */}
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            onClick={() => setSelectedModule("home")}
            sx={{
              borderRadius: 1.5,
              py: 1.1,
              px: 1.5,
              bgcolor: selectedModule === "home" ? "#f39c12" : "transparent",
              color: selectedModule === "home" ? "#17202a" : "#dfe6e9",
              textTransform: "none",
              "&:hover": { bgcolor: selectedModule === "home" ? "#e67e22" : "rgba(255,255,255,0.06)" },
            }}
          >
            <ListItemIcon sx={{ color: selectedModule === "home" ? "#17202a" : "#f39c12", minWidth: 36 }}>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" primaryTypographyProps={{ fontWeight: selectedModule === "home" ? 700 : 500 }} />
          </ListItemButton>
        </ListItem>

        {/* Navbar - Shows when NavBuilder card is clicked (controlled by parent) */}
        {showNavbarInSidebar && (
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => setSelectedModule("navbar")}
              sx={{
                borderRadius: 1.5,
                py: 1.1,
                px: 1.5,
                bgcolor: selectedModule === "navbar" ? "#f39c12" : "transparent",
                color: selectedModule === "navbar" ? "#17202a" : "#dfe6e9",
                textTransform: "none",
                "&:hover": { bgcolor: selectedModule === "navbar" ? "#e67e22" : "rgba(255,255,255,0.06)" },
              }}
            >
              <ListItemIcon sx={{ color: selectedModule === "navbar" ? "#17202a" : "#f39c12", minWidth: 36 }}>
                <MenuIcon />
              </ListItemIcon>
              <ListItemText primary="Navbar" primaryTypographyProps={{ fontWeight: selectedModule === "navbar" ? 700 : 500 }} />
            </ListItemButton>
          </ListItem>
        )}

        {/* Your Layout */}
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            onClick={() => setSelectedModule("yourLayout")}
            sx={{
              borderRadius: 1.5,
              py: 1.1,
              px: 1.5,
              bgcolor: selectedModule === "yourLayout" ? "#f39c12" : "transparent",
              color: selectedModule === "yourLayout" ? "#17202a" : "#dfe6e9",
              textTransform: "none",
              "&:hover": { bgcolor: selectedModule === "yourLayout" ? "#e67e22" : "rgba(255,255,255,0.06)" },
            }}
          >
            <ListItemIcon sx={{ color: selectedModule === "yourLayout" ? "#17202a" : "#f39c12", minWidth: 36 }}>
              <ViewQuilt />
            </ListItemIcon>
            <ListItemText primary="Your Layout" primaryTypographyProps={{ fontWeight: selectedModule === "yourLayout" ? 700 : 500 }} />
          </ListItemButton>
        </ListItem>
      </List>

      <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.06)" }} />

      <Typography variant="caption" sx={{ opacity: 0.8 }}>
        Selected: {String(selectedModule).toUpperCase()}
      </Typography>
    </Box>
  );
};

export default Sidebar;
