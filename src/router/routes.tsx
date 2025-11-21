// src/router/routes.tsx
import React from "react";
import HomeIcon from "@mui/icons-material/Home";
import MenuIcon from "@mui/icons-material/Menu";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import PeopleIcon from "@mui/icons-material/People";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import InfoIcon from "@mui/icons-material/Info";
import { RouteConfig } from "../types/routes";
import OnboardingWizard from "../pages/OnboardingWizard";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";


export const routeMap: RouteConfig[] = [
  {
  key: "onboarding",
  label: "Get Started",
  path: "/onboarding",
  component: "OnboardingWizard",
  icon: <RocketLaunchIcon />,
},
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
  {
    key: "footer",
    label: "Footer",
    path: "/footer",
    component: "FooterModule",
    icon: <MenuIcon />,
  },
  {
    key: "testimonials",
    label: "Testimonials",
    path: "/testimonials",
    component: "TestimonialsModule",
    icon: <PeopleIcon />,
  },
  {
    key: "newsletter",
    label: "Newsletter",
    path: "/newsletter",
    component: "NewsletterModule",
    icon: <MailOutlineIcon />,
  },
  {
    key: "team",
    label: "Team",
    path: "/team",
    component: "TeamModule",
    icon: <InfoIcon />,
  },
  
];
