// src/types/routes.ts
import React from "react";
import { NavbarConfig } from "./navbar";

// Include CarouselModule in the union so routes and router compile
export type ComponentKey = 'HomeModule' | 'NavbarBuilderPage' | 'CarouselModule' | 'EmptyModule' | 'YourLayoutModule';

export interface RouteConfig {
  key: string;
  label: string;
  path: string;
  component: ComponentKey;
  icon: React.ReactElement;
}

export interface PageProps {
  setSelectedModule: (moduleKey: string) => void;
  moduleName?: string;
  savedNavbarConfig?: NavbarConfig;
  setSavedNavbarConfig?: (config: NavbarConfig) => void;
}

export interface SidebarProps {
  selectedModule: string;
  setSelectedModule: (moduleKey: string) => void;
  showNavbarInSidebar?: boolean;
}

export interface RouterLayoutProps extends SidebarProps {
  savedNavbarConfig?: NavbarConfig;
  setSavedNavbarConfig?: (config: NavbarConfig) => void;
  showNavbarInSidebar?: boolean;
}