//src/App.tsx
import React, { useState } from "react";
import { Box, AppBar, Toolbar, IconButton, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import RouterLayout from "./router/RouterLayout";
import { routeMap } from "./router/routes";
import { NavbarConfig } from "./types/navbar";
import HeroCarousel from "./pages/Carousal";

export default function App() {
  const [selectedModule, setSelectedModule] = useState<string>("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [savedNavbarConfig, setSavedNavbarConfig] = useState<NavbarConfig | undefined>(undefined);
  const [showNavbarInSidebar, setShowNavbarInSidebar] = useState<boolean>(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // IMPORTANT: showNavbarInSidebar should only be true when navbar module is active.
  const handleModuleChange = (moduleKey: string) => {
    setShowNavbarInSidebar(moduleKey === "navbar");
    setSelectedModule(moduleKey);
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "Inter, sans-serif" }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: "#2c3e50" }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={toggleSidebar} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {routeMap.find((r) => r.key === selectedModule)?.label || "Dashboard"}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: "flex", width: "100%", mt: "64px", transition: "all 0.3s ease" }}>
        <RouterLayout
          selectedModule={selectedModule}
          setSelectedModule={handleModuleChange}
          isSidebarOpen={isSidebarOpen}
          savedNavbarConfig={savedNavbarConfig}
          setSavedNavbarConfig={setSavedNavbarConfig}
          showNavbarInSidebar={showNavbarInSidebar}
        />
      </Box>
    </Box>
  );
}
