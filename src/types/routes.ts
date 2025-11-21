// src/types/routes.ts
import React from "react";
import { NavbarConfig } from "./navbar";

/**
 * Keys for the components/pages that the router can render.
 * Add new module keys here (e.g. 'FooterModule', 'NewsletterModule', 'TeamModule').
 */
export type ComponentKey =
  | "OnboardingWizard"
  | "HomeModule"
  | "NavbarBuilderPage"
  | "CarouselModule"
  | "EmptyModule"
  | "YourLayoutModule"
  | "FooterModule"
  | "TestimonialsModule"
  | "NewsletterModule"
  | "TeamModule"; // <-- added TeamModule

/**
 * Map of component keys -> React components.
 * Exported so RouterLayout (or other modules) can import and type the map correctly.
 * Use React.ComponentType<any> for flexibility (some pages accept extra/custom props).
 */
export type ComponentMap = {
  [K in ComponentKey]: React.ComponentType<any>;
};

/**
 * Route configuration used to build the sidebar / routing table.
 * `component` references one of the ComponentKey values above.
 */
export interface RouteConfig {
  key: string;
  label: string;
  path: string;
  component: ComponentKey;
  icon: React.ReactElement;
}

/**
 * Props commonly passed to page modules inside the builder.
 * Keep these reasonably generic so different modules can accept them.
 */
export interface PageProps {
  setSelectedModule?: (moduleKey: string) => void;
  moduleName?: string | undefined;
  savedNavbarConfig?: NavbarConfig;
  setSavedNavbarConfig?: (config: NavbarConfig) => void;
}

/** Sidebar props */
export interface SidebarProps {
  selectedModule: string;
  setSelectedModule: (moduleKey: string) => void;
  showNavbarInSidebar?: boolean;
}

/** Props expected by the RouterLayout container */
export interface RouterLayoutProps extends SidebarProps {
  savedNavbarConfig?: NavbarConfig;
  setSavedNavbarConfig?: (config: NavbarConfig) => void;
  showNavbarInSidebar?: boolean;
}
