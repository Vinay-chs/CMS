// src/router/routes.tsx
import React from "react";
import HomeIcon from "@mui/icons-material/Home";
import MenuIcon from "@mui/icons-material/Menu";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import { RouteConfig } from "../types/routes"; // <- fixed relative path

export const routeMap: RouteConfig[] = [
  {
    key: "home",
    label: "Home",
    path: "/",
    component: "HomeModule",
    icon: <HomeIcon />,
  },
  {
    key: "navbar",
    label: "Navbar",
    path: "/navbar",
    component: "NavbarBuilderPage",
    icon: <MenuIcon />,
  },
  {
    key: "carousel",
    label: "Carousels",
    path: "/carousel",
    component: "CarouselModule",
    icon: <SlideshowIcon />,
  },
  {
    key: "yourLayout",
    label: "Your Layout",
    path: "/yourlayout",
    component: "YourLayoutModule",
    icon: <HomeIcon />,
  },
];