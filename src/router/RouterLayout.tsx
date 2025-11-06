// src/router/RouterLayout.tsx
import React from "react";
import { Box } from "@mui/material";
import { RouterLayoutProps, ComponentKey, PageProps } from "../types/routes";
import { routeMap } from "./routes";
import HomeModule from "../pages/HomeModule";
import NavbarBuilderPage from "../pages/NavBuilder";
import EmptyModule from "../pages/EmptyModule";
import YourLayoutModule from "../pages/YourLayout";
import Carousal from "../pages/Carousal"; // wrapper page (accepts PageProps)
import Sidebar from "../components/Sidebar";

/**
 * IMPORTANT:
 * Previously we typed the componentMap as { [K in ComponentKey]: React.FC<PageProps> }
 * which failed when some components expected other props (e.g. Carousel expects `slides`).
 *
 * Change: use React.ComponentType<any> for flexibility so components with custom props
 * (like Carousel) can still be mapped here without TypeScript errors.
 *
 * This keeps runtime behavior identical but avoids the TS mismatch.
 */

type ComponentMap = {
  [K in ComponentKey]: React.ComponentType<any>;
};

const componentMap: ComponentMap = {
  HomeModule,
  NavbarBuilderPage,
  CarouselModule: Carousal, // Carousal is a wrapper page that renders the Carousel internally
  EmptyModule,
  YourLayoutModule,
};

const RouterLayout: React.FC<
  RouterLayoutProps & {
    isSidebarOpen: boolean;
  }
> = ({
  selectedModule,
  setSelectedModule,
  isSidebarOpen,
  setSavedNavbarConfig,
  savedNavbarConfig,
  showNavbarInSidebar,
}) => {
  const activeRoute = routeMap.find((r) => r.key === selectedModule) || routeMap[0];
  const componentKey = (activeRoute.component || "HomeModule") as ComponentKey;
  const ComponentToRender = componentMap[componentKey];

  // Make sure we pass PageProps where expected; other components can ignore extras.
  const commonPageProps: PageProps = {
    setSelectedModule,
    moduleName: activeRoute.label,
    savedNavbarConfig,
    setSavedNavbarConfig,
  };

  return (
    <Box sx={{ display: "flex", flexGrow: 1, width: "100%", transition: "all 0.3s ease" }}>
      {isSidebarOpen && (
        <Box sx={{ width: 260, position: "relative", height: "calc(100vh - 64px)", top: 0 }}>
          <Sidebar
            selectedModule={selectedModule}
            setSelectedModule={setSelectedModule}
            showNavbarInSidebar={showNavbarInSidebar}
          />
        </Box>
      )}

      <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, minHeight: "calc(100vh - 64px)", overflow: "auto" }}>
        {/* Render the mapped component, passing common PageProps.
            Components that require extra props (e.g. Carousel) should either
            accept PageProps or internally provide their required data. */}
        <ComponentToRender {...commonPageProps} />
      </Box>
    </Box>
  );
};

export default RouterLayout;
