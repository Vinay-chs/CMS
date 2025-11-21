// src/router/RouterLayout.tsx
import React from "react";
import { Box } from "@mui/material";
import { RouterLayoutProps, ComponentKey, PageProps, ComponentMap } from "../types/routes";
import { routeMap } from "./routes";
import HomeModule from "../pages/HomeModule";
import NavbarBuilderPage from "../pages/NavBuilder";
import EmptyModule from "../pages/EmptyModule";
import YourLayoutModule from "../pages/YourLayout";
import Carousal from "../pages/Carousal"; // wrapper page (accepts PageProps)
import FooterEditor from "../pages/FooterEditor"; // ensure this exists
import Sidebar from "../components/Sidebar";
import TestimonialsBuilderMUI from "../pages/Testimonials";
import Newsletter from "../pages/Newsletter";
import TeamSection from "../pages/TeamSection"; // <- Team module import
import OnboardingWizard from "../pages/OnboardingWizard";

/**
 * Component map typed from ./types/routes (ComponentMap).
 * Each key from ComponentKey must have a corresponding entry here.
 * React.ComponentType<any> is used so components with custom props don't cause TS errors.
 */
const componentMap: ComponentMap = {
  HomeModule,
  NavbarBuilderPage,
  CarouselModule: Carousal,
  EmptyModule,
  YourLayoutModule,
  FooterModule: FooterEditor,
  TestimonialsModule: TestimonialsBuilderMUI,
  NewsletterModule: Newsletter,
  TeamModule: TeamSection,
  OnboardingWizard, // <-- ADD THIS
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
  // tolerant matching: normalize selectedModule and try several fallbacks
  const normalizedSelected = (selectedModule || "").toString().trim().toLowerCase();

  let activeRoute = routeMap.find((r) => {
    if (!r?.key) return false;
    return r.key.toString().trim().toLowerCase() === normalizedSelected;
  });

  // If not found, try matching against route.component (component key)
  if (!activeRoute) {
    activeRoute = routeMap.find((r) => {
      const componentName = (r.component || "").toString().trim().toLowerCase();
      return componentName === normalizedSelected;
    });
  }

  // If still not found, try matching by label (friendly name)
  if (!activeRoute) {
    activeRoute = routeMap.find((r) => (r.label || "").toString().trim().toLowerCase() === normalizedSelected);
  }

  // final fallback to first route and warn in console (dev only)
  if (!activeRoute) {
    // eslint-disable-next-line no-console
    console.warn(`[RouterLayout] selectedModule "${selectedModule}" did not match any route keys; falling back to first route.`);
    activeRoute = routeMap[0];
  }

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
