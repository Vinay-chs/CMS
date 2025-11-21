// src/App.tsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Box, IconButton, Toolbar, AppBar, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import Sidebar from "./components/Sidebar";
// import SlugLandingPage from "./pages/SlugLandingPage";
import HomeModule from "./pages/HomeModule";
import NavBuilder from "./pages/NavBuilder";
import Carousal from "./pages/Carousal";
import FooterEditor from "./pages/FooterEditor";
import Newsletter from "./pages/Newsletter";
import TeamSection from "./pages/TeamSection";
import Testimonials from "./pages/Testimonials";
import EmptyModule from "./pages/EmptyModule";
import { NavbarConfig } from "./types/navbar";
import { SlugProvider } from "./context/SlugContext";
import OnboardingWizard from "./pages/OnboardingWizard";

/* keep these in sync with Sidebar */
const SIDEBAR_WIDTH = 260;
const COLLAPSED_WIDTH = 72;
const TOPBAR_HEIGHT = 64;


function App() {
  const [selectedModule, setSelectedModule] = useState<string>("home");
  const [savedNavbarConfig, setSavedNavbarConfig] = useState<NavbarConfig | null>(null);
  const [showNavbarInSidebar] = useState(false);

  // allow the user to skip the slug landing (session-only)
  const [allowSkip, setAllowSkip] = useState<boolean>(false);

  // Sidebar open/closed state
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Check if user has set a base slug
  const hasBaseSlug = !!localStorage.getItem("cms_base_slug");

  const renderModule = () => {
    switch (selectedModule) {
      case "home":
        return <HomeModule setSelectedModule={setSelectedModule} setAllowSkip={setAllowSkip} />;
      case "navbar":
        return <NavBuilder setSelectedModule={setSelectedModule} setSavedNavbarConfig={setSavedNavbarConfig} />;
      case "carousel":
        return <Carousal setSelectedModule={setSelectedModule} />;
      case "footer":
        return <FooterEditor />;
      case "newsletter":
        return <Newsletter />;
      case "team":
        return <TeamSection />;
      case "testimonials":
        return <Testimonials />;
      case "yourLayout":
        return <EmptyModule moduleName="Your Layout" />;
      default:
        return <HomeModule setSelectedModule={setSelectedModule} setAllowSkip={setAllowSkip} />;
    }
  };

  // If base slug not set and user hasn't chosen to skip, show landing page (full screen)
  if (!hasBaseSlug && !allowSkip) {
    // return <SlugLandingPage setSelectedModule={setSelectedModule} setAllowSkip={setAllowSkip} />;
     return <OnboardingWizard setSelectedModule={setSelectedModule} setAllowSkip={setAllowSkip} />;
  }

  return (
    <Router>
      {/* Topbar */}
      <AppBar position="fixed" color="primary" sx={{ height: TOPBAR_HEIGHT, justifyContent: "center", zIndex: 1400 }}>
        <Toolbar sx={{ minHeight: TOPBAR_HEIGHT, display: "flex", gap: 1 }}>
          <IconButton edge="start" color="inherit" onClick={() => setSidebarOpen((s) => !s)} aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            CMS Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Sidebar
        selectedModule={selectedModule}
        setSelectedModule={setSelectedModule}
        showNavbarInSidebar={showNavbarInSidebar}
        open={sidebarOpen}
        topbarHeight={TOPBAR_HEIGHT}
      />

      {/* Main content: offset by sidebar width and topbar height */}
      <Box
        component="main"
        sx={{
          ml: sidebarOpen ? `${SIDEBAR_WIDTH}px` : `${COLLAPSED_WIDTH}px`,
          mt: `${TOPBAR_HEIGHT}px`,
          p: 3,
          transition: "margin-left 240ms cubic-bezier(.2,.8,.2,1)",
          minHeight: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
          background: (theme) => theme.palette.background.default,
        }}
      >
        {renderModule()}
      </Box>
    </Router>
  );
}

export default App;
