// src/components/Sidebar.tsx
import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Tooltip,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ViewQuiltIcon from "@mui/icons-material/ViewQuilt";
import MenuIcon from "@mui/icons-material/Menu";

export type SidebarProps = {
  selectedModule?: string;
  setSelectedModule?: (m: string) => void;
  showNavbarInSidebar?: boolean;
  open?: boolean;
  topbarHeight?: number; // optional: so we can position below topbar
};

const SIDEBAR_WIDTH = 260;
const COLLAPSED_WIDTH = 72;

const Sidebar: React.FC<SidebarProps> = ({
  selectedModule = "home",
  setSelectedModule = () => {},
  showNavbarInSidebar = false,
  open = true,
  topbarHeight = 64,
}) => {
  const itemSx = (active: boolean) => ({
    borderRadius: 1.5,
    py: 1.1,
    px: 1.5,
    bgcolor: active ? "#f39c12" : "transparent",
    color: active ? "#17202a" : "#dfe6e9",
    "&:hover": { bgcolor: active ? "#e67e22" : "rgba(255,255,255,0.04)" },
    display: "flex",
    alignItems: "center",
    gap: 1,
  });

  const iconSx = (active: boolean) => ({ color: active ? "#17202a" : "#f39c12", minWidth: 36 });

  return (
    <Box
      component="aside"
      sx={{
        width: open ? SIDEBAR_WIDTH : COLLAPSED_WIDTH,
        bgcolor: "#17202a",
        color: "#ecf0f1",
        height: `calc(100vh - ${topbarHeight}px)`,
        position: "fixed",
        top: topbarHeight,
        left: 0,
        overflow: "hidden",
        transition: "width 240ms cubic-bezier(.2,.8,.2,1)",
        borderRight: open ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(255,255,255,0.02)",
        zIndex: 1300,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ p: open ? 2 : 1 }}>
        {open && (
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: "#f7c948" }}>
            CMS
          </Typography>
        )}

        <List disablePadding>
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton onClick={() => setSelectedModule && setSelectedModule("home")} sx={itemSx(selectedModule === "home")}>
              <ListItemIcon sx={iconSx(selectedModule === "home")}>
                <HomeIcon />
              </ListItemIcon>
              {open && <ListItemText primary="Home" primaryTypographyProps={{ fontWeight: selectedModule === "home" ? 700 : 500 }} />}
            </ListItemButton>
          </ListItem>

          {showNavbarInSidebar && (
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton onClick={() => setSelectedModule && setSelectedModule("navbar")} sx={itemSx(selectedModule === "navbar")}>
                <ListItemIcon sx={iconSx(selectedModule === "navbar")}>
                  <MenuIcon />
                </ListItemIcon>
                {open && <ListItemText primary="Navbar" primaryTypographyProps={{ fontWeight: selectedModule === "navbar" ? 700 : 500 }} />}
              </ListItemButton>
            </ListItem>
          )}

          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton onClick={() => setSelectedModule && setSelectedModule("yourLayout")} sx={itemSx(selectedModule === "yourLayout")}>
              <ListItemIcon sx={iconSx(selectedModule === "yourLayout")}>
                <ViewQuiltIcon />
              </ListItemIcon>
              {open && <ListItemText primary="Your Layout" primaryTypographyProps={{ fontWeight: selectedModule === "yourLayout" ? 700 : 500 }} />}
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      <Box sx={{ p: open ? 2 : 1 }}>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: open ? 1.5 : 0 }} />
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: open ? "space-between" : "center" }}>
          {open ? (
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Selected: {String(selectedModule).toUpperCase()}
            </Typography>
          ) : (
            <Tooltip title={`Selected: ${String(selectedModule).toUpperCase()}`}>
              <Box sx={{ width: 32, height: 32 }} />
            </Tooltip>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;
