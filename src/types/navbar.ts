//src/types/navbar.ts
export type Position = "left" | "center" | "right";

export type NavbarComponentType =
  | "logo"
  | "title"
  | "banner"
  | "menuLinks"
  | "dropdownMenu"
  | "megaMenu"
  | "externalLinks"
  | "searchBar"
  | "searchIcon"
  | "advancedSearch"
  | "cartIcon"
  | "wishlistIcon"
  | "notificationBell"
  | "languageSelector"
  | "themeToggle"
  | "profileIcon"
  | "profileDropdown"
  | "loginSignup"
  | "customLinks"
  | "ctaButton"
  | "contactInfo"
  | "socialIcons"
  | "breadcrumbs"
  | "secondaryNavbar"
  | "layoutOptions";

export interface NavbarComponentConfig {
  src?: string;
  alt?: string;
  text?: string;
  link?: string;
  links?: { id: string; label: string; path: string }[];
  placeholder?: string;
  initials?: string;
  url?: string;
  componentId?: string; // For cartIcon, wishlistIcon, etc.
  badge?: number; // For cartIcon, wishlistIcon
  showTotal?: boolean; // For cartIcon
  [key: string]: any; // Allow additional config properties for flexibility
}

export interface NavbarComponent {
  id: string;
  type: NavbarComponentType;
  position: Position;
  config?: NavbarComponentConfig;
  sequence: number;
}

export type NavbarTheme = "light" | "dark";

export type NavbarStyle = "round" | "square" | "shadow" | "floating" | "none";

// ../types/navbar.ts
export interface NavbarConfig {
  siteId: string;
  components: NavbarComponent[];
  version: number;
  published: boolean;
  theme?: NavbarTheme;
  color?: string;
  style?: NavbarStyle;
  size?: { width: string; height: string }; // Add this line
}

export type AvailableComponent = {
  value: string;
  label: string;
  description: string;
};

export type componentLogo = {
  id: number;
  src: string;
  alt: string;
  uploaded: boolean;
};

