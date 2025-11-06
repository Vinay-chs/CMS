// src/components/NavbarRenderer.tsx
import React from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Typography,
  Avatar,
  InputBase,
  Badge,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FavoriteIcon from "@mui/icons-material/Favorite";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import { NavbarConfig, NavbarComponent } from "../types/navbar";

type Props = {
  config: NavbarConfig;
  onThemeToggle?: () => void;
};

const renderComp = (comp: NavbarComponent, onThemeToggle?: () => void) => {
  const cfg = comp.config || {};
  switch (comp.type) {
    case "logo":
    case "banner":
      return (
        <Box key={comp.id} sx={{ mx: 1, display: "flex", alignItems: "center" }}>
          {cfg.src ? (
            <img
              src={cfg.src}
              alt={cfg.alt || comp.type}
              style={{ maxHeight: 44, objectFit: "contain" }}
            />
          ) : (
            <Box sx={{ color: "inherit", fontWeight: 700 }}>{(cfg.alt || comp.type).toUpperCase()}</Box>
          )}
        </Box>
      );

    case "title":
      return (
        <Typography
          key={comp.id}
          variant="subtitle1"
          component="a"
          href={cfg.link || "/"}
          sx={{ color: "inherit", textDecoration: "none", mx: 1, fontWeight: 700 }}
        >
          {cfg.text || "Site Title"}
        </Typography>
      );

    case "menuLinks":
      return (
        <Box key={comp.id} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {(cfg.links || []).map((l: any) => (
            <Button
              key={l.id}
              color="inherit"
              href={l.path || "#"}
              sx={{ textTransform: "none", minWidth: 48, px: 1 }}
            >
              {l.label}
            </Button>
          ))}
        </Box>
      );

    case "searchBar":
      return (
        <Box
          key={comp.id}
          sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: "rgba(255,255,255,0.08)",
            px: 1,
            borderRadius: 1,
            minWidth: 160,
            gap: 0.5,
          }}
        >
          <InputBase
            placeholder={cfg.placeholder || "Search..."}
            sx={{ fontSize: 14, ml: 0.5 }}
            inputProps={{ "aria-label": "search" }}
          />
          <IconButton size="small" aria-label="search">
            <SearchIcon fontSize="small" />
          </IconButton>
        </Box>
      );

    case "cartIcon":
      return (
        <IconButton key={comp.id} color="inherit" aria-label="cart">
          <Badge badgeContent={cfg.badge ?? 0} color="error">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
      );

    case "wishlistIcon":
      return (
        <IconButton key={comp.id} color="inherit" aria-label="wishlist">
          <Badge badgeContent={cfg.badge ?? 0} color="secondary">
            <FavoriteIcon />
          </Badge>
        </IconButton>
      );

    case "notificationBell":
      return (
        <IconButton key={comp.id} color="inherit" aria-label="notifications">
          <Badge badgeContent={cfg.count ?? 0} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      );

    case "languageSelector":
      return (
        <Button key={comp.id} color="inherit" sx={{ textTransform: "none" }}>
          {cfg.default || (cfg.languages && cfg.languages[0]) || "EN"}
        </Button>
      );

    case "themeToggle":
      return (
        <IconButton key={comp.id} color="inherit" onClick={onThemeToggle} aria-label="theme toggle">
          <Brightness4Icon />
        </IconButton>
      );

    case "profileIcon":
      return cfg.src ? (
        <Avatar key={comp.id} src={cfg.src} sx={{ width: 36, height: 36 }} />
      ) : (
        <Avatar key={comp.id} sx={{ width: 36, height: 36 }}>
          {(cfg.initials || "U").slice(0, 2)}
        </Avatar>
      );

    case "loginSignup":
      return (
        <Box key={comp.id} sx={{ display: "flex", gap: 1 }}>
          {cfg.showLogin && <Button color="inherit" sx={{ textTransform: "none" }}>Login</Button>}
          {cfg.showSignup && (
            <Button variant="contained" color="secondary" sx={{ textTransform: "none", borderRadius: 2 }}>
              Signup
            </Button>
          )}
        </Box>
      );

    case "ctaButton":
      return (
        <Button key={comp.id} variant="contained" sx={{ borderRadius: 2, textTransform: "none" }} href={cfg.url || "#"}>
          {cfg.text || "Action"}
        </Button>
      );

    default:
      return null;
  }
};

const NavRenderer: React.FC<Props> = ({ config, onThemeToggle }) => {
  const comps = config.components || [];
  const left = comps.filter((c) => c.position === "left");
  const center = comps.filter((c) => c.position === "center");
  const right = comps.filter((c) => c.position === "right");

  const getAppBarStyles = () => {
    switch (config.style) {
      case "round":
        return { borderRadius: 12, overflow: "hidden", margin: 0 };
      case "square":
        return { borderRadius: 0, overflow: "hidden", margin: 0 };
      case "shadow":
        return { borderRadius: 8, overflow: "hidden", boxShadow: "0 6px 18px rgba(0,0,0,0.08)", margin: 0 };
      case "floating":
        return { borderRadius: 12, overflow: "hidden", boxShadow: "0 12px 30px rgba(0,0,0,0.08)", margin: "12px auto", maxWidth: "1100px" };
      case "none":
      default:
        return { borderRadius: 0, margin: 0 };
    }
  };

  return (
    <AppBar
      position="static"
      color="primary"
      sx={{
        backgroundColor: config.color || undefined,
        color: "#e4e7e6",
        px: { xs: 1, sm: 2 },
        ...getAppBarStyles(),
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", minHeight: 64 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {left.map((c) => renderComp(c, onThemeToggle))}
        </Box>

        <Box sx={{ display: "flex", flex: 1, justifyContent: "center", gap: 2, alignItems: "center", px: 1 }}>
          {center.map((c) => renderComp(c, onThemeToggle))}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {right.map((c) => renderComp(c, onThemeToggle))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavRenderer;
// pothuraju