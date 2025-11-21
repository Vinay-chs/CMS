// src/pages/FooterEditor.tsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  Card,
  CardContent,
  Stack,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
import SendIcon from "@mui/icons-material/Send";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import XIcon from "@mui/icons-material/X";
import FacebookIcon from "@mui/icons-material/Facebook";
import PublicIcon from "@mui/icons-material/Public";
import { v4 as uuid } from "uuid";

const STORAGE_KEY = "footer_config_v2"; // Version update chesa

/** Types */
type FooterLink = { id: string; label: string; href: string };
type FooterColumn = { id: string; title?: string; links?: FooterLink[]; x?: number; y?: number };
type FooterSocial = { id?: string; provider?: string; href?: string; providerLabel?: string; x?: number; y?: number };
type FooterConfig = {
  slug?: string; // ✅ SLUG ADD CHESTHA
  logoUrl?: string;
  logoAlt?: string;
  backgroundColor?: string;
  textColor?: string;
  columns?: FooterColumn[];
  showNewsletter?: boolean;
  copyrightText?: string;
  social?: FooterSocial[];
};

/** Defaults */
const emptyConfig = (): FooterConfig => ({
  slug: "", // ✅ SLUG ADD CHESTHA
  logoUrl: "",
  logoAlt: "",
  backgroundColor: "#1976D2",
  textColor: "#e6eef6",
  columns: [],
  showNewsletter: false,
  copyrightText: `© ${new Date().getFullYear()} Your Company`,
  social: [],
});

const providerOptions = [
  { value: "instagram", label: "Instagram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "twitter", label: "Twitter" },
  { value: "facebook", label: "Facebook" },
  { value: "other", label: "Other" },
];

const providerPlaceholder = (prov?: string) => {
  switch ((prov || "").toLowerCase()) {
    case "instagram":
      return "https://instagram.com/yourprofile";
    case "whatsapp":
      return "https://wa.me/1234567890";
    case "linkedin":
      return "https://www.linkedin.com/in/yourprofile";
    case "twitter":
      return "https://twitter.com/yourprofile";
    case "facebook":
      return "https://facebook.com/yourpage";
    default:
      return "https://example.com/";
  }
};

const providerIcon = (provider?: string) => {
  switch ((provider || "").toLowerCase()) {
    case "instagram":
      return <InstagramIcon />;
    case "whatsapp":
      return <WhatsAppIcon />;
    case "linkedin":
      return <LinkedInIcon />;
    case "twitter":
      return <XIcon />;
    case "facebook":
      return <FacebookIcon />;
    default:
      return <PublicIcon />;
  }
};

/** ColorPickerDialog placeholder */
const ColorPickerDialog: React.FC<any> = ({ open, onClose, currentColor, onColorChange, title }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <TextField
            label="Color Hex"
            value={currentColor}
            onChange={(e) => onColorChange(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Box
            sx={{
              width: 100,
              height: 100,
              backgroundColor: currentColor,
              border: '1px solid #ccc',
              borderRadius: 1
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onClose} variant="contained">Apply</Button>
      </DialogActions>
    </Dialog>
  );
};

export default function FooterEditor() {
  // ✅ SLUG STATE ADD CHESTHA
  const [slug, setSlug] = useState<string>("");
  const[snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info" | "warning">("info");
  const [config, setConfig] = useState<FooterConfig>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as FooterConfig;
        const cols = (parsed.columns || []).map((c: any) => ({
          id: c.id || uuid(),
          title: c.title || "",
          links: (c.links || []).map((l: any) => ({ id: l.id || uuid(), label: l.label || "", href: l.href || "" })),
          x: typeof c.x === "number" ? c.x : 10 + Math.random() * 20,
          y: typeof c.y === "number" ? c.y : 20 + Math.random() * 20,
        }));
        const social = (parsed.social || []).map((s: any, i: number) => ({
          id: s.id || uuid(),
          provider: s.provider || "",
          href: s.href || "",
          providerLabel: s.providerLabel,
          x: typeof s.x === "number" ? s.x : 10 + (i * 8),
          y: typeof s.y === "number" ? s.y : 80,
        }));
        return { ...parsed, slug: parsed.slug || "", columns: cols, social };
      }
    } catch {}
    return emptyConfig();
  });

  const [gap, setGap] = useState<number>(20);
  const [colDialogOpen, setColDialogOpen] = useState(false);
  const [newColTitle, setNewColTitle] = useState("");
  const [linkDialogState, setLinkDialogState] = useState<any>({ open: false });
  const [colorDialogOpen, setColorDialogOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterError, setNewsletterError] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const footerRef = useRef<HTMLDivElement | null>(null);

  // Free-drag state
  const draggingRef = useRef<{ id: string | null; type: "column" | "social" | null; offsetX: number; offsetY: number }>(
    { id: null, type: null, offsetX: 0, offsetY: 0 }
  );

  // ✅ SLUG INCLUDED IN PERSISTENCE
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...config, slug, gap }));
    } catch {}
  }, [config, slug, gap]);

  useEffect(() => {
    if (!config.showNewsletter) {
      setNewsletterEmail("");
      setNewsletterError(null);
      setSubscribed(false);
    }
  }, [config.showNewsletter]);

  // ---------- Column helpers ----------
  const addColumn = (title = "") => {
    const col: FooterColumn = { id: uuid(), title, links: [], x: 10 + Math.random() * 10, y: 30 + Math.random() * 10 };
    setConfig((c) => ({ ...c, columns: [...(c.columns || []), col] }));
    return col.id;
  };

  const removeColumn = (id: string) => setConfig((c) => ({ ...c, columns: (c.columns || []).filter((col) => col.id !== id) }));
  const updateColumnTitle = (id: string, title: string) => setConfig((c) => ({ ...c, columns: (c.columns || []).map((col) => (col.id === id ? { ...col, title } : col)) }));
  const addLinkToColumn = (colId: string, label = "", href = "#") => setConfig((c) => ({ ...c, columns: (c.columns || []).map((col) => col.id === colId ? { ...col, links: [...(col.links || []), { id: uuid(), label, href }] } : col) }));
  const updateLink = (colId: string, linkId: string, updates: { label?: string; href?: string }) => setConfig((c) => ({ ...c, columns: (c.columns || []).map((col) => col.id === colId ? { ...col, links: (col.links || []).map((l) => (l.id === linkId ? { ...l, ...updates } : l)) } : col) }));
  const removeLink = (colId: string, linkId: string) => setConfig((c) => ({ ...c, columns: (c.columns || []).map((col) => col.id === colId ? { ...col, links: (col.links || []).filter((l) => l.id !== linkId) } : col) }));

  // move column by index
  const moveColumn = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= (config.columns?.length || 0)) return;
    setConfig((c) => {
      const newColumns = [...(c.columns || [])];
      [newColumns[index], newColumns[newIndex]] = [newColumns[newIndex], newColumns[index]];
      return { ...c, columns: newColumns };
    });
  };

  // ---------- Social helpers ----------
  const addSocial = (provider = "instagram") => setConfig((c) => ({ ...c, social: [...(c.social || []), { id: uuid(), provider, href: providerPlaceholder(provider), x: 10 + Math.random() * 10, y: 80 }] }));
  const removeSocial = (index: number) => setConfig((c) => ({ ...c, social: (c.social || []).filter((_, i) => i !== index) }));
  const updateSocial = (index: number, updates: Partial<FooterSocial>) => setConfig((c) => {
    const next = [...(c.social || [])];
    next[index] = { ...(next[index] || {}), ...updates };
    return { ...c, social: next };
  });

  const moveSocial = (fromIndex: number, toIndex: number) => {
    setConfig((c) => {
      const arr = [...(c.social || [])];
      if (fromIndex < 0 || fromIndex >= arr.length) return c;
      const [item] = arr.splice(fromIndex, 1);
      arr.splice(Math.max(0, Math.min(toIndex, arr.length)), 0, item);
      return { ...c, social: arr };
    });
  };

  const handleProviderChange = (idx: number, providerValue: string) => {
    const p = (providerValue || "").toString().toLowerCase();
    const placeholder = providerPlaceholder(p);
    if (p === "other") updateSocial(idx, { provider: "other", href: "", providerLabel: "" });
    else updateSocial(idx, { provider: p, href: placeholder, providerLabel: undefined });
  };

  // ✅ SLUG INCLUDED IN RESET
  const reset = () => {
    setConfig(emptyConfig());
    setSlug("");
    setGap(20);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  // newsletter
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const handleSubscribe = () => {
    setNewsletterError(null);
    if (!newsletterEmail.trim()) { setNewsletterError("Please enter an email address."); return; }
    if (!validateEmail(newsletterEmail.trim())) { setNewsletterError("Please enter a valid email address."); return; }
    setSubscribed(true); setSnackOpen(true);
  };

  // ---------- Drop from editor into preview ----------
  const handleDropOnFooter = (e: React.DragEvent) => {
    e.preventDefault();
    const colId = e.dataTransfer.getData("text/column");
    const socialIndex = e.dataTransfer.getData("text/social-index");
    const rect = footerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = e.clientX;
    const clientY = e.clientY;
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));

    if (colId) {
      setConfig((c) => ({
        ...c,
        columns: (c.columns || []).map((col) => (col.id === colId ? { ...col, x, y } : col)),
      }));
      return;
    }

    if (socialIndex) {
      const idx = Number(socialIndex);
      setConfig((c) => {
        const next = [...(c.social || [])];
        if (idx >= 0 && idx < next.length) {
          next[idx] = { ...next[idx], x, y };
        }
        return { ...c, social: next };
      });
      return;
    }
  };

  const allowFooterDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // ---------- Preview free drag ----------
  const onPreviewMouseDown = (e: React.MouseEvent, id: string, type: "column" | "social") => {
    const rect = footerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const target = (e.currentTarget as HTMLElement);
    const targetRect = target.getBoundingClientRect();
    const offsetX = e.clientX - targetRect.left;
    const offsetY = e.clientY - targetRect.top;
    draggingRef.current = { id, type, offsetX, offsetY };
    e.preventDefault();
  };

  const onMouseMoveWindow = useCallback((ev: MouseEvent) => {
    const dragging = draggingRef.current;
    if (!dragging.id || !dragging.type || !footerRef.current) return;
    const rect = footerRef.current.getBoundingClientRect();
    const clientX = ev.clientX;
    const clientY = ev.clientY;

    const x = Math.max(0, Math.min(100, ((clientX - rect.left - dragging.offsetX + 8) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top - dragging.offsetY + 8) / rect.height) * 100));

    setConfig((c) => {
      if (dragging.type === "column") {
        return { ...c, columns: (c.columns || []).map((col) => (col.id === dragging.id ? { ...col, x, y } : col)) };
      } else {
        return { ...c, social: (c.social || []).map((s) => (s.id === dragging.id ? { ...s, x, y } : s)) };
      }
    });
  }, []);

  const onMouseUpWindow = useCallback(() => {
    draggingRef.current = { id: null, type: null, offsetX: 0, offsetY: 0 };
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMoveWindow);
    window.addEventListener("mouseup", onMouseUpWindow);
    return () => {
      window.removeEventListener("mousemove", onMouseMoveWindow);
      window.removeEventListener("mouseup", onMouseUpWindow);
    };
  }, [onMouseMoveWindow, onMouseUpWindow]);

  // ---------- Drag from editor to preview ----------
  const onEditorColDragStart = (e: React.DragEvent, colId: string) => {
    e.dataTransfer.setData("text/column", colId);
    try { e.dataTransfer.effectAllowed = "move"; } catch {}
  };

  const onEditorSocialDragStart = (e: React.DragEvent, idx: number) => {
    e.dataTransfer.setData("text/social-index", String(idx));
    try { e.dataTransfer.effectAllowed = "move"; } catch {}
  };

  // ---------- Preview inline renderer ----------
  const PreviewFooter: React.FC = () => {
    const cols = config.columns || [];
    const socials = config.social || [];
    return (
      <Box sx={{ width: "100%", height: "100%", boxSizing: "border-box", color: config.textColor || "#fff", position: "relative" }}>
        {/* Logo left + socials automatically placed */}
        <Box sx={{ position: "absolute", left: "2%", top: "3%", display: "flex", alignItems: "center", gap: 2 }}>
          {config.logoUrl ? <img src={config.logoUrl} alt={config.logoAlt || "logo"} style={{ height: 36 }} /> : <Typography sx={{ fontWeight: 700 }}>{config.logoAlt || "Your Brand"}</Typography>}
        </Box>

        {/* Socials as absolute icons */}
        {(socials || []).map((s, idx) => {
          const left = (typeof s.x === "number") ? `${s.x}%` : `${10 + idx * 8}%`;
          const top = (typeof s.y === "number") ? `${s.y}%` : "80%";
          return (
            <Box
              key={s.id || idx}
              sx={{ position: "absolute", left, top, transform: "translate(-50%,-50%)", cursor: "grab" }}
              onMouseDown={(e) => onPreviewMouseDown(e, s.id!, "social")}
              draggable
              onDragStart={(e) => onEditorSocialDragStart(e, idx)}
            >
              <Tooltip title={s.provider || "social"}>
                <IconButton
                  component="a"
                  href={s.href || "#"}
                  target="_blank"
                  sx={{ color: config.textColor || "#fff", bgcolor: "transparent", border: `1px solid rgba(255,255,255,0.12)`, width: 36, height: 36 }}
                >
                  {providerIcon(s.provider)}
                </IconButton>
              </Tooltip>
            </Box>
          );
        })}

        {/* Columns as absolute boxes */}
        {(cols || []).map((col) => {
          const left = (typeof col.x === "number") ? `${col.x}%` : "10%";
          const top = (typeof col.y === "number") ? `${col.y}%` : "30%";
          return (
            <Box
              key={col.id}
              sx={{ position: "absolute", left, top, transform: "translate(-50%,-50%)", minWidth: 160, cursor: "grab", userSelect: "none" }}
              onMouseDown={(e) => onPreviewMouseDown(e, col.id!, "column")}
              draggable
              onDragStart={(e) => onEditorColDragStart(e, col.id!)}
            >
              <Box sx={{ background: "transparent", p: 1, borderRadius: 1 }}>
                <Typography sx={{ color: config.textColor || "#fff", fontWeight: 700, mb: 1 }}>{col.title}</Typography>
                <Stack spacing={0.5}>
                  {(col.links || []).map((l) => (
                    <a key={l.id} href={l.href} style={{ color: "rgba(255,255,255,0.9)", textDecoration: "none", fontSize: 14, display: "block" }}>
                      {l.label}
                    </a>
                  ))}
                </Stack>
              </Box>
            </Box>
          );
        })}

        {/* copyright bottom-left */}
        <Box sx={{ position: "absolute", left: "4%", bottom: "4%" }}>
          <Typography sx={{ color: "rgba(255,255,255,0.9)" }}>{config.copyrightText}</Typography>
        </Box>

        {/* ✅ SLUG DISPLAY IN PREVIEW */}
        {slug && (
          <Box sx={{ position: "absolute", right: "4%", bottom: "4%" }}>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
              Slug: {slug}
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  const hasContent = (cfg?: FooterConfig) => {
    if (!cfg) return false;
    if (cfg.logoUrl) return true;
    const cols = cfg.columns || [];
    if (cols.length > 0) {
      if (cols.some((c) => (c.title && c.title.trim()) || (c.links && c.links.length > 0))) return true;
    }
    const social = cfg.social || [];
    if (social.length > 0) return true;
    if ((cfg.copyrightText || "").trim()) return true;
    if (cfg.showNewsletter) return true;
    return false;
  };

  // ✅ SLUG VALIDATION
  const validateSlug = (slug: string) => {
    return /^[a-z0-9-]+$/.test(slug);
  };

  // ✅ SAVE TO BACKEND FUNCTION
  const saveToBackend = async () => {
    if (!slug.trim()) {
      setSnackbarMessage("Slug is required!");
      setSnackbarSeverity("error");
      setSnackOpen(true);
      return;
    }

    if (!validateSlug(slug)) {
      setSnackbarMessage("Slug can only contain lowercase letters, numbers, and hyphens");
      setSnackbarSeverity("error");
      setSnackOpen(true);
      return;
    }

    // Backend API call with slug
    const payload = {
      slug: slug,
      config: config,
      createdAt: new Date().toISOString()
    };

    try {
      // Replace with your actual API endpoint
      const response = await fetch('http://localhost:8080/api/footers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSnackbarMessage(`Footer saved with slug: ${slug}`);
        setSnackbarSeverity("success");
        setSnackOpen(true);
      } else {
        throw new Error('Failed to save footer');
      }
    } catch (error) {
      setSnackbarMessage("Failed to save footer. Please try again.");
      setSnackbarSeverity("error");
      setSnackOpen(true);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Footer Editor
        </Typography>

        <Stack direction="row" spacing={1}>
          <TextField
            label="Column gap (px)"
            type="number"
            size="small"
            value={gap}
            onChange={(e) => setGap(Math.max(0, Number(e.target.value || 0)))}
            sx={{ width: 140 }}
            InputProps={{ inputProps: { min: 0 } }}
          />
          <Button variant="outlined" onClick={() => { /* preview inline */ }}>
            Preview
          </Button>
          {/* ✅ SAVE BUTTON WITH SLUG */}
          <Button variant="contained" onClick={saveToBackend}>
            Save Footer
          </Button>
          <Button variant="contained" color="error" onClick={reset}>
            Reset
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={2}>
        {/* Left column (brand & colors) */}
        <Grid >
          <Card sx={{ borderRadius: 2, boxShadow: 2, height: "100%" }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Brand & Colors
              </Typography>
              
              {/* ✅ SLUG INPUT FIELD */}
              <TextField 
                label="Footer Slug *" 
                value={slug} 
                onChange={(e) => setSlug(e.target.value)}
                placeholder="main-footer"
                helperText="URL-friendly identifier (e.g., main-footer, contact-page-footer)"
                size="small" 
                fullWidth 
                required
                error={!!slug && !validateSlug(slug)}
              />
              
              <Stack spacing={2}>
                <TextField label="Logo URL" value={config.logoUrl || ""} placeholder="https://example.com/logo.png" size="small" fullWidth onChange={(e) => setConfig((c) => ({ ...c, logoUrl: e.target.value }))} />
                <TextField label="Logo alt text" value={config.logoAlt || ""} placeholder="Your company name" size="small" fullWidth onChange={(e) => setConfig((c) => ({ ...c, logoAlt: e.target.value }))} />
                <TextField label="Text color (HEX)" value={config.textColor || ""} placeholder="#e6eef6" size="small" fullWidth onChange={(e) => setConfig((c) => ({ ...c, textColor: e.target.value }))} />
                <TextField label="Copyright text" value={config.copyrightText || ""} placeholder={`© ${new Date().getFullYear()} Your Company`} size="small" fullWidth onChange={(e) => setConfig((c) => ({ ...c, copyrightText: e.target.value }))} />
                <FormControlLabel control={<Switch checked={!!config.showNewsletter} onChange={(e) => setConfig((c) => ({ ...c, showNewsletter: e.target.checked }))} />} label="Show newsletter signup" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Right column (columns, social, background) */}
        <Grid >
          <Stack spacing={2}>
            {/* Columns editor */}
            <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Columns (drag from list to preview or move in preview)
                  </Typography>
                  <Button startIcon={<AddIcon />} onClick={() => { setNewColTitle(""); setColDialogOpen(true); }} size="small" variant="outlined">
                    Add column
                  </Button>
                </Box>

                {(!config.columns || config.columns.length === 0) && (
                  <Box sx={{ py: 2, textAlign: "center", color: "text.secondary" }}>
                    <Typography variant="body2">No columns yet — click "Add column" to get started.</Typography>
                  </Box>
                )}

                <Stack spacing={2}>
                  {(config.columns || []).map((col, index) => (
                    <Card key={col.id} variant="outlined" sx={{ p: 1 }} draggable onDragStart={(e) => { e.dataTransfer.setData("text/column", col.id!); }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <TextField label="Column title" size="small" value={col.title || ""} onChange={(e) => updateColumnTitle(col.id!, e.target.value)} fullWidth />
                            <IconButton size="small" onClick={() => moveColumn(index, "up")} disabled={index === 0} color="primary"><ArrowUpwardIcon /></IconButton>
                            <IconButton size="small" onClick={() => moveColumn(index, "down")} disabled={index === (config.columns?.length || 0) - 1} color="primary"><ArrowDownwardIcon /></IconButton>
                          </Box>

                          <Box sx={{ mt: 1 }}>
                            {(col.links || []).map((l) => (
                              <Box key={l.id} sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
                                <LinkIcon fontSize="small" />
                                <TextField value={l.label} size="small" placeholder="Link label (e.g. About)" onChange={(e) => updateLink(col.id!, l.id, { label: e.target.value })} sx={{ minWidth: 120 }} />
                                <TextField value={l.href} size="small" placeholder="https://example.com/page" onChange={(e) => updateLink(col.id!, l.id, { href: e.target.value })} fullWidth />
                                <IconButton size="small" onClick={() => removeLink(col.id!, l.id)} aria-label="Remove link">
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            ))}

                            <Box sx={{ mt: 1 }}>
                              <Button size="small" startIcon={<AddIcon />} variant="text" onClick={() => addLinkToColumn(col.id!, "Link", "#")}>
                                Add link
                              </Button>
                            </Box>
                          </Box>
                        </Box>

                        <Box sx={{ ml: 1 }}>
                          <Tooltip title="Remove column">
                            <IconButton color="error" onClick={() => removeColumn(col.id!)}><DeleteIcon /></IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Card>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* Social links */}
            <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Social links</Typography>
                  <Button startIcon={<AddIcon />} size="small" variant="outlined" onClick={() => addSocial("instagram")}>Add</Button>
                </Box>

                <Stack spacing={1}>
                  {(config.social || []).map((s, idx) => {
                    const provider = (s.provider || "").toString();
                    const showUrlInput = !!provider;
                    return (
                      <Box key={s.id || idx} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <FormControl size="small" sx={{ minWidth: 180 }}>
                          <InputLabel>Provider</InputLabel>
                          <Select label="Provider" value={provider} onChange={(e) => handleProviderChange(idx, e.target.value as string)}>
                            <MenuItem value=""><em>Choose</em></MenuItem>
                            {providerOptions.map((opt) => (<MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>))}
                          </Select>
                        </FormControl>

                        {provider === "other" && (
                          <TextField size="small" placeholder="Provider name (e.g., Pinterest)" value={s.providerLabel || ""} onChange={(e) => updateSocial(idx, { providerLabel: e.target.value })} sx={{ minWidth: 160 }} />
                        )}

                        {showUrlInput ? (
                          <TextField size="small" placeholder={providerPlaceholder(provider)} value={s.href || ""} onChange={(e) => updateSocial(idx, { href: e.target.value })} sx={{ flex: 1, minWidth: 220 }} />
                        ) : (
                          <Box sx={{ flex: 1, color: "text.secondary", fontSize: 13 }}>Select a provider to enter URL</Box>
                        )}

                        <IconButton color="error" onClick={() => removeSocial(idx)}><DeleteIcon /></IconButton>
                      </Box>
                    );
                  })}

                  {(!config.social || config.social.length === 0) && (
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      No social links yet — add ones the site should show.
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Background color */}
            <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Background Color</Typography>
                <Button variant="outlined" onClick={() => setColorDialogOpen(true)} startIcon={<ColorLensIcon />} sx={{ borderColor: config.backgroundColor, color: "text.primary", display: "inline-flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, borderRadius: "50%", bgcolor: config.backgroundColor, border: "1px solid rgba(0,0,0,0.12)" }} />
                  <Typography sx={{ fontWeight: 600 }}>Choose footer color</Typography>
                </Button>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Live preview (drop target) */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Live preview (drag anywhere or drop from editor)</Typography>

        <Box
          ref={footerRef}
          onDragOver={allowFooterDrop}
          onDrop={handleDropOnFooter}
          sx={{
            width: "100%",
            height: "360px",
            background: config.backgroundColor || "#0f1724",
            color: config.textColor || "#e6eef6",
            borderRadius: 1,
            mb: 2,
            p: 3,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {hasContent(config) ? <PreviewFooter /> : (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.6)" }}>Drop columns here — this plane is full-width and will be used as the footer area.</Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Add column dialog */}
      <Dialog open={colDialogOpen} onClose={() => setColDialogOpen(false)}>
        <DialogTitle>Add column</DialogTitle>
        <DialogContent>
          <TextField autoFocus label="Column title" value={newColTitle} onChange={(e) => setNewColTitle(e.target.value)} fullWidth size="small" helperText="E.g. Products, Company, Support" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setColDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => { const id = addColumn(newColTitle.trim() || "New Column"); setColDialogOpen(false); }}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Link dialog */}
      <Dialog open={!!linkDialogState.open} onClose={() => setLinkDialogState({ open: false })}>
        <DialogTitle>{linkDialogState.linkId ? "Edit link" : "Add link"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Label" value={linkDialogState.label || ""} onChange={(e) => setLinkDialogState((s: any) => ({ ...s, label: e.target.value }))} size="small" fullWidth helperText="Visible text for the link (e.g. About, Contact)" />
            <TextField label="URL" value={linkDialogState.href || ""} onChange={(e) => setLinkDialogState((s: any) => ({ ...s, href: e.target.value }))} size="small" fullWidth helperText="Full URL or internal path (e.g. https://example.com/page)" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialogState({ open: false })}>Cancel</Button>
          <Button onClick={() => {
            const { colId, linkId, label, href } = linkDialogState;
            if (!colId) { setLinkDialogState({ open: false }); return; }
            const trimmedLabel = (label || "").trim() || "Link";
            const trimmedHref = (href || "").trim() || "#";
            if (linkId) updateLink(colId, linkId, { label: trimmedLabel, href: trimmedHref });
            else addLinkToColumn(colId, trimmedLabel, trimmedHref);
            setLinkDialogState({ open: false });
          }} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Color picker dialog */}
      <ColorPickerDialog open={colorDialogOpen} onClose={() => setColorDialogOpen(false)} currentColor={config.backgroundColor || "#1976D2"} onColorChange={(newColor: string) => setConfig((c) => ({ ...c, backgroundColor: newColor }))} title="Select Footer Color" />

      <Snackbar open={snackOpen} anchorOrigin={{ horizontal: "center", vertical: "bottom" }} autoHideDuration={2500} onClose={() => setSnackOpen(false)}>
        <Alert onClose={() => setSnackOpen(false)} severity="success" sx={{ width: "100%" }}>Saved</Alert>
      </Snackbar>
    </Box>
  );
}