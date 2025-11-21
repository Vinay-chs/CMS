// src/components/FooterRenderer.tsx
import React from "react";
import { Box, Typography, Link, IconButton } from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";
import FacebookIcon from "@mui/icons-material/Facebook";
import PublicIcon from "@mui/icons-material/Public";

/* Types */
export type FooterLink = { id: string; label: string; href: string };
export type FooterColumn = { id: string; title?: string; links?: FooterLink[] };
export type FooterSocial = { id?: string; provider?: string; href?: string; providerLabel?: string };
export type FooterConfig = {
  logoUrl?: string;
  logoAlt?: string;
  backgroundColor?: string;
  textColor?: string;
  columns?: FooterColumn[];
  showNewsletter?: boolean;
  copyrightText?: string;
  social?: FooterSocial[];
};

/* provider -> icon mapping (used by renderer) */
const providerIcon = (provider?: string) => {
  switch ((provider || "").toLowerCase()) {
    case "instagram":
      return <InstagramIcon />;
    case "whatsapp":
      return <WhatsAppIcon />;
    case "linkedin":
      return <LinkedInIcon />;
    case "twitter":
      return <TwitterIcon />;
    case "facebook":
      return <FacebookIcon />;
    default:
      return <PublicIcon />;
  }
};

const FooterRenderer: React.FC<{ config: FooterConfig }> = ({ config }) => {
  const bg = config.backgroundColor || "#1976D2";
  const text = config.textColor || "#fff";

  return (
    <Box sx={{ width: "100%", height: "100%", p: 3, boxSizing: "border-box" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
        {/* logo or text */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {config.logoUrl ? (
            <img src={config.logoUrl} alt={config.logoAlt || "logo"} style={{ height: 36 }} />
          ) : (
            <Typography sx={{ color: text, fontWeight: 700 }}>{config.logoAlt || "Your Brand"}</Typography>
          )}
        </Box>

        {/* spacer */}
        <Box sx={{ flex: 1 }} />

        {/* social icons */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {(config.social || []).map((s, i) => {
            const prov = (s.provider || "").toString().toLowerCase();
            const href = s.href || "#";
            return (
              <IconButton
                key={s.id || `${prov}-${i}`}
                component={href ? "a" : "button"}
                href={href || undefined}
                target={href ? "_blank" : undefined}
                rel={href ? "noreferrer noopener" : undefined}
                sx={{
                  color: text,
                  bgcolor: "transparent",
                  border: `1px solid rgba(255,255,255,0.12)`,
                  width: 36,
                  height: 36,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                }}
                aria-label={s.providerLabel || s.provider || `social-${i}`}
              >
                {providerIcon(prov)}
              </IconButton>
            );
          })}
        </Box>
      </Box>

      {/* columns and copyright */}
      <Box sx={{ mt: 4, display: "flex", gap: 4, alignItems: "flex-start" }}>
        {(config.columns || []).map((col) => (
          <Box key={col.id} sx={{ minWidth: 160 }}>
            {col.title && <Typography sx={{ color: text, fontWeight: 700, mb: 1 }}>{col.title}</Typography>}
            {(col.links || []).map((l) => (
              <Link key={l.id} href={l.href} underline="none" sx={{ display: "block", color: "rgba(255,255,255,0.9)", mb: 0.5 }}>
                {l.label}
              </Link>
            ))}
          </Box>
        ))}

        <Box sx={{ flex: 1 }} />

        <Box>
          <Typography sx={{ color: "rgba(255,255,255,0.9)" }}>{config.copyrightText || ""}</Typography>
        </Box>
      </Box>

      {/* wrapper to visually match preview */}
      <Box sx={{ position: "absolute", inset: 0, background: bg, zIndex: -1 }} />
    </Box>
  );
};

export default FooterRenderer;
