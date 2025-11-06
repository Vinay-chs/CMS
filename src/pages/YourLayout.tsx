// src/pages/YourLayout.tsx
import React, { useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import NavRenderer from "../components/NavbarRenderer";
import type { NavbarConfig } from "../types/navbar";
import type { Slide } from "./Carousal";

/**
 * YourLayout page now supports:
 * - rendering savedNavbarConfig (existing behavior)
 * - rendering a carousel preview that the editor saved to localStorage under key "preview_carousel"
 *
 * If preview exists, it shows the preview above the navbar. Preview can be dismissed (removes the preview key).
 */

const PREVIEW_KEY = "preview_carousel";

const YourLayoutModule: React.FC<{
  setSelectedModule?: (moduleKey: string) => void;
  moduleName?: string;
  savedNavbarConfig?: NavbarConfig;
}> = ({ setSelectedModule, moduleName, savedNavbarConfig }) => {
  const [preview, setPreview] = useState<null | {
    carouselId?: string | null;
    selectedStyle?: any;
    slides: Slide[];
    carouselSize?: { width: string; height: string };
    slideIntervalMs?: number;
    carouselSiteId?: string;
  }>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREVIEW_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.slides)) {
          setPreview(parsed);
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const dismissPreview = () => {
    try {
      localStorage.removeItem(PREVIEW_KEY);
    } catch {}
    setPreview(null);
  };

  // Get navbar size from savedNavbarConfig, fallback to defaults if not present
  const navbarSize = savedNavbarConfig?.size || { width: "100%", height: "60px" };
  const navbarStyle = savedNavbarConfig?.style || "none";

  return (
    <Box sx={{ p: 5, minHeight: "100vh" }}>
      <Typography variant="h4" gutterBottom>
        {moduleName || "Your Layout"}
      </Typography>

      {/* If preview exists render it */}
      {preview ? (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Carousel Preview</Typography>

          {/* simple hero preview (same style used by editor) */}
          <Box
            sx={{
              width: preview.carouselSize?.width || "100%",
              height: preview.carouselSize?.height || "400px",
              borderRadius: 2,
              overflow: "hidden",
              position: "relative",
              mb: 2,
              boxShadow: 3,
            }}
          >
            <PreviewCarousel slides={preview.slides} interval={preview.slideIntervalMs ?? 5000} />
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="outlined" onClick={dismissPreview}>Dismiss Preview</Button>
            <Button variant="contained" onClick={() => { /* keep preview and allow user to interact */ }}>Keep Preview</Button>
          </Box>
        </Box>
      ) : null}

      {/* Navbar preview if provided */}
      {savedNavbarConfig ? (
        <Box
          sx={{
            width: navbarSize.width,
            height: navbarSize.height,
            borderRadius: navbarStyle === "round" ? "16px" : "0px",
            overflow: "hidden",
            backgroundColor: "#fff",
            boxShadow: 3,
            mb: 3,
          }}
        >
          <NavRenderer config={savedNavbarConfig as NavbarConfig} />
        </Box>
      ) : (
        <Typography variant="body1" sx={{ mb: 2 }}>
          No Content Published yet. Please Publish your Content from the Dashboard.
        </Typography>
      )}

      <Box sx={{ mt: 3 }}>
        <Button variant="contained" onClick={() => setSelectedModule && setSelectedModule("home")}>Go to Home</Button>
      </Box>
    </Box>
  );
};

export default YourLayoutModule;

/* -----------------------
   Lightweight Preview Carousel used on YourLayout page
   This is intentionally small — just enough to preview the slides.
   Re-uses same Slide shape as editor.
   ----------------------- */

function PreviewCarousel({ slides, interval = 5000 }: { slides: Slide[]; interval?: number }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), interval);
    return () => clearInterval(t);
  }, [slides.length, interval]);

  if (!slides || slides.length === 0) {
    return (
      <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "grey.100" }}>
        <Typography>Add slides to preview</Typography>
      </Box>
    );
  }

  const s = slides[index];

  return (
    <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          backgroundImage: s.image ? `url(${s.image})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <Box sx={{ position: "absolute", inset: 0, backgroundColor: s.darkOverlay ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.15)" }} />
      <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "white", p: 3, textAlign: "center" }}>
        {s.title && <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>{s.title}</Typography>}
        {s.subtitle && <Typography variant="body1" sx={{ mb: 2 }}>{s.subtitle}</Typography>}
        {s.ctaText && <Button variant="contained" onClick={() => { if (s.ctaHref) window.open(s.ctaHref, "_blank"); }}>{s.ctaText}</Button>}
      </Box>

      {slides.length > 1 && (
        <>
          <Button
            onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
            sx={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", bgcolor: "rgba(0,0,0,0.4)", color: "white" }}
          >
            Prev
          </Button>

          <Button
            onClick={() => setIndex((i) => (i + 1) % slides.length)}
            sx={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", bgcolor: "rgba(0,0,0,0.4)", color: "white" }}
          >
            Next
          </Button>
        </>
      )}
    </Box>
  );
}