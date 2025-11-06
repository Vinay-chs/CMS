// src/pages/NavBuilder.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Button,
  FormControl,
  TextField,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Chip,
  Card,
  CardContent,
  InputLabel,
  Fade,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import { v4 as uuid } from "uuid";
import NavRenderer from "../components/NavbarRenderer";
import { ChromePicker } from "react-color";
import { NavbarTheme } from "../types/navbar";
import {
  NavbarComponent,
  NavbarComponentType,
  NavbarConfig,
  Position,
} from "../types/navbar";
import { PageProps } from "../types/routes";

const BASE_URL = "http://localhost:8080";
const MAX_COMPONENTS_PER_POSITION = 4;

interface LogoPayload {
  src?: string;
  alt?: string;
  uploaded?: boolean;
  data?: string;
  contentType?: string;
  component?: { id: number };
  position?: string;
  sequence?: number;
}

interface CustomNavbarConfigPayload {
  userId: string;
  configName: string;
  siteId: string;
  jsonConfig: string;
  isActive: boolean;
}

interface NavbarCreationRequest {
  navbarConfig: CustomNavbarConfigPayload;
  logoPayloads: LogoPayload[];
}

type AvailableComponentLocal = {
  id: number;
  value: string;
  label: string;
  description?: string;
};

type NavbarStyle = "none" | "round" | "square";

interface ConfigWithStyle extends NavbarConfig {
  style: NavbarStyle;
  size?: { width: string; height: string };
}

const availableNavbarStyles: { value: NavbarStyle; label: string; description: string }[] = [
  { value: "none", label: "Default", description: "Clean minimal style" },
  { value: "round", label: "Rounded", description: "Soft rounded corners" },
  { value: "square", label: "Sharp", description: "Crisp square edges" },
];

function defaultPositionFor(type: NavbarComponentType): Position {
  switch (type) {
    case "logo":
    case "cartIcon":
    case "profileIcon":
      return "right";
    case "menuLinks":
      return "center";
    case "searchBar":
    case "themeToggle":
      return "right";
    default:
      return "right";
  }
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export default function NavBuilder({ setSelectedModule, setSavedNavbarConfig }: PageProps) {
  const [components, setComponents] = useState<NavbarComponent[]>([]);
  const [selected, setSelected] = useState<NavbarComponentType | "">("");
  const [siteId, setSiteId] = useState<string>("");
  const [siteIdError, setSiteIdError] = useState(false);
  const [navbarColor, setNavbarColor] = useState<string>("#1976d2");
  const [theme, setTheme] = useState<NavbarTheme>("light");
  const [navbarStyle, setNavbarStyle] = useState<NavbarStyle>("none");
  const [navbarSize, setNavbarSize] = useState<{ width: string; height: string }>( {
    width: "100%",
    height: "60px", // Default neat height
  });
  const [availableComponents, setAvailableComponents] = useState<AvailableComponentLocal[]>([]);
  const [loadingComponents, setLoadingComponents] = useState(true);
  const [resettingNavbar, setResettingNavbar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [tempColor, setTempColor] = useState<string>(navbarColor);
  const [prevColor, setPrevColor] = useState<string>(navbarColor);

  const [pendingFiles, setPendingFiles] = useState<Record<string, File | null>>({});
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const previewUrlsRef = useRef(previewUrls);
  useEffect(() => { previewUrlsRef.current = previewUrls; }, [previewUrls]);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "info" | "warning" | "error">("success");
  const handleCloseSnackbar = (_: any, reason?: string) => { if (reason === "clickaway") return; setSnackbarOpen(false); };

  const [isSaved, setIsSaved] = useState(false);
  const [savedConfigId, setSavedConfigId] = useState<number | string | null>(null);
  const [savedConfigHash, setSavedConfigHash] = useState<string | null>(null);

  // Handle unitless input (assume px if no unit)
  const parseSize = (value: string): string => {
    if (!value) return value;
    const trimmed = String(value).trim();
    // If pure number, treat as px
    if (/^\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`;
    return trimmed;
  };

  useEffect(() => {
    const components: AvailableComponentLocal[] = [
      { id: 1, value: "logo", label: "Logo (Upload/URL)", description: "Brand logo with upload or URL" },
      { id: 2, value: "menuLinks", label: "Menu Links", description: "Navigation links" },
      { id: 3, value: "searchBar", label: "Search Bar", description: "Search input" },
      { id: 4, value: "cartIcon", label: "Cart Icon", description: "Shopping cart indicator" },
      { id: 5, value: "profileIcon", label: "Profile Icon / Login-Signup", description: "User profile or login/signup" },
      { id: 6, value: "themeToggle", label: "Theme Toggle", description: "Toggle between light and dark themes" },
    ];
    setAvailableComponents(components);
    setLoadingComponents(false);
  }, []);

  useEffect(() => {
    try {
      const lastSite = localStorage.getItem('navbar_last_saved_siteId');
      if (lastSite) {
        const saved = localStorage.getItem(`navbar_saved_${lastSite}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.components) {
            setSiteId(parsed.siteId || lastSite);
            setComponents(parsed.components || []);
            setNavbarColor(parsed.color || '#1976d2');
            setTheme(parsed.theme || 'light');
            setNavbarStyle(parsed.style || 'none');
            setNavbarSize(parsed.size || { width: "100%", height: "60px" });
            const snapshot = JSON.stringify(parsed);
            setSavedConfigHash(snapshot);
            setIsSaved(true);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to restore saved navbar from localStorage', e);
    }
  }, []);

  const deleteNavbarConfigOnServer = async (configId: number | string) => {
    const res = await fetch(`${BASE_URL}/custom-navbar-config/delete/${configId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => res.statusText || "");
      throw new Error(`delete config failed ${res.status}: ${txt}`);
    }
    try { return await res.json(); } catch { return true; }
  };

  const updateComponent = (id: string, patch: Partial<NavbarComponent>) =>
    setComponents((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, ...patch, config: { ...c.config, ...(patch.config || {}) } } : c
      )
    );

  const handleFileSelectLocal = (compId: string, file: File) => {
    const prevUrl = previewUrlsRef.current[compId];
    if (prevUrl) URL.revokeObjectURL(prevUrl);

    const url = URL.createObjectURL(file);
    setPreviewUrls((prev) => ({ ...prev, [compId]: url }));
    setPendingFiles((prev) => ({ ...prev, [compId]: file }));

    updateComponent(compId, {
      config: {
        ...(components.find((c) => c.id === compId)?.config || {}),
        src: url,
        serverId: undefined,
        logoId: undefined,
      },
    });
  };

  const handlePositionChange = (compId: string, newPosition: Position) => {
    setComponents(prev => prev.map(c => c.id === compId ? { ...c, position: newPosition } : c));
  };

  const addComponent = () => {
    if (!selected) return;

    const defaultPos = defaultPositionFor(selected as NavbarComponentType);
    const existingInPosition = components.filter(c => c.position === defaultPos);
    if (existingInPosition.length >= MAX_COMPONENTS_PER_POSITION) {
      setSnackbarMessage(`Maximum ${MAX_COMPONENTS_PER_POSITION} components allowed in ${defaultPos.toUpperCase()}`);
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    const picked = availableComponents.find((a) => a.value === selected);
    const newComp: NavbarComponent & { componentId?: number | undefined } = {
      id: uuid(),
      type: selected as NavbarComponentType,
      componentId: picked ? picked.id : undefined,
      position: defaultPos,
      sequence: 1,
      config: (() => {
        switch (selected) {
          case "logo": return { src: "", alt: "Logo" };
          case "menuLinks": return { links: [{ id: uuid(), label: "Home", path: "/" }] };
          case "searchBar": return { placeholder: "Search..." };
          case "cartIcon": return { count: 0 };
          case "profileIcon": return { src: "", initials: "U", loginUrl: "/login", signupUrl: "/signup" };
          case "themeToggle": return { currentTheme: "light" };
          default: return {};
        }
      })(),
    };
    setComponents((s) => [...s, newComp]);
    setSelected("");
  };

  const removeComponent = async (id: string) => {
    const comp = components.find((c) => c.id === id);
    if (!comp) return;

    const ok = window.confirm("Remove this component?");
    if (!ok) return;

    const url = previewUrlsRef.current[id];
    if (url) { URL.revokeObjectURL(url); setPreviewUrls((p) => { const copy = {...p}; delete copy[id]; return copy; }); }
    setPendingFiles((p) => { const copy = {...p}; delete copy[id]; return copy; });

    setComponents((prev) => prev.filter((p) => p.id !== id));
    setSnackbarMessage("Component removed");
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
  };

  const updateMenuLink = (compId: string, linkId: string, field: "label" | "path", value: string) =>
    setComponents((prev) =>
      prev.map((c) =>
        c.id === compId
          ? {
              ...c,
              config: {
                ...c.config,
                links: (c.config?.links || []).map((l: any) => l.id === linkId ? { ...l, [field]: value } : l),
              },
            }
          : c
      )
    );

  const addMenuLink = (compId: string) =>
    setComponents((prev) =>
      prev.map((c) =>
        c.id === compId ? { ...c, config: { ...c.config, links: [...(c.config?.links || []), { id: uuid(), label: "New", path: "/" }] } } : c
      )
    );

  const removeMenuLink = (compId: string, linkId: string) =>
    setComponents((prev) =>
      prev.map((c) =>
        c.id === compId ? { ...c, config: { ...c.config, links: (c.config?.links || []).filter((l: any) => l.id !== linkId) } } : c
      )
    );

  const leftComps = components.filter(c => c.position === 'left');
  const centerComps = components.filter(c => c.position === 'center');
  const rightComps = components.filter(c => c.position === 'right');
  const displayComponents = [...leftComps, ...centerComps, ...rightComps];

  const exportData: ConfigWithStyle = { siteId, components: displayComponents, color: navbarColor, theme, style: navbarStyle, size: navbarSize, version: 1, published: false };

  const saveNavbarConfig = async (): Promise<any | null> => {
    setIsSaving(true);
    try {
      if (siteId.trim() === "") {
        setSiteIdError(true);
        setSnackbarMessage("Site ID is required");
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
        setIsSaving(false);
        return null;
      }
      setSiteIdError(false);

      const currentSnapshotObj = {
        siteId,
        components: components.map((c: any) => ({
          type: c.type,
          position: c.position,
          config: c.config
        })),
        color: navbarColor,
        theme,
        style: navbarStyle,
        size: navbarSize,
        version: 1,
        published: false
      };
      const currentSnapshot = JSON.stringify(currentSnapshotObj);

      if (savedConfigHash && currentSnapshot === savedConfigHash) {
        setSnackbarMessage("Configuration already saved");
        setSnackbarSeverity("info");
        setSnackbarOpen(true);
        setIsSaving(false);
        return { id: savedConfigId };
      }

      const logoComps = components.filter((c) => c.type === "logo");
      const logoPayloads: LogoPayload[] = [];
      
      for (const logoComp of logoComps) {
        const logoFile = pendingFiles[logoComp.id];
        const logoCfg = logoComp.config || {};
        const backendComponentId = (logoComp as any).componentId;

        let logoPayload: LogoPayload = { 
          alt: logoCfg.alt || "Logo", 
          component: backendComponentId ? { id: backendComponentId } : undefined,
          position: logoComp.position,
          sequence: logoComp.sequence
        };

        if (logoFile) {
          const base64String = await fileToBase64(logoFile);
          logoPayload = { ...logoPayload, src: base64String, uploaded: true, contentType: logoFile.type };
        } else if (logoCfg.src) {
          if (logoCfg.src.startsWith("http")) {
            logoPayload = { ...logoPayload, src: logoCfg.src, uploaded: false };
          } else if (logoCfg.src.startsWith("data:")) {
            logoPayload = { ...logoPayload, src: logoCfg.src, uploaded: true };
          } else if (logoCfg.serverId) {
            logoPayload = { ...logoPayload, src: logoCfg.src, uploaded: false };
          } else {
            logoPayload = { ...logoPayload, src: "https://via.placeholder.com/150x50/1976d2/ffffff?text=Logo", uploaded: false };
          }
        } else {
          logoPayload = { ...logoPayload, src: "https://via.placeholder.com/150x50/1976d2/ffffff?text=Logo", uploaded: false };
        }
        logoPayloads.push(logoPayload);
      }

      const customNavbarConfigPayload: CustomNavbarConfigPayload = {
        userId: uuid(),
        configName: `Navbar-${siteId}-${new Date().toISOString()}`,
        siteId: siteId,
        jsonConfig: JSON.stringify(currentSnapshotObj),
        isActive: true,
      };
      
      const combinedRequest: NavbarCreationRequest = { navbarConfig: customNavbarConfigPayload, logoPayloads };

      const res = await fetch(`${BASE_URL}/custom-navbar-config/create`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(combinedRequest),
      });

      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = "Unknown error";
        try {
          const errorBody = JSON.parse(errorText);
          errorMessage = errorBody.message || errorBody.error || errorText;
        } catch {
          errorMessage = errorText || res.statusText;
        }
        
        if (res.status === 400) {
          setSnackbarMessage("Configuration may already exist: " + errorMessage);
          setSnackbarSeverity("warning");
          setSnackbarOpen(true);
          setIsSaving(false);
          return null;
        }
        throw new Error(`Save failed: ${res.status}: ${errorMessage}`);
      }

      const savedConfig = await res.json();
      const savedLogoIds = savedConfig.logoIds || [];

      const updatedComponents = components.map((c) => {
        if (c.type === "logo") {
          const logoIndex = logoComps.findIndex(lc => lc.id === c.id);
          if (logoIndex >= 0 && savedLogoIds[logoIndex]) {
            return { 
              ...c, 
              config: { ...c.config, serverId: savedLogoIds[logoIndex], src: `${BASE_URL}/componentlogo/${savedLogoIds[logoIndex]}` } 
            };
          }
        }
        return c;
      });

      setComponents(updatedComponents);

      logoComps.forEach(logoComp => {
        if (pendingFiles[logoComp.id]) {
          const prev = previewUrls[logoComp.id];
          if (prev) { try { URL.revokeObjectURL(prev); } catch {} }
          setPreviewUrls((p) => { const copy = {...p}; delete copy[logoComp.id]; return copy; });
          setPendingFiles((p) => { const copy = {...p}; delete copy[logoComp.id]; return copy; });
        }
      });

      const snapshotObj = { 
        siteId,
        components: updatedComponents.map((c: any) => ({ type: c.type, position: c.position, config: c.config })),
        color: navbarColor, theme, style: navbarStyle, size: navbarSize, version: 1, published: false 
      };
      const snapshot = JSON.stringify(snapshotObj);
      setSavedConfigId(savedConfig.id ?? null);
      setSavedConfigHash(snapshot);
      setIsSaved(true);

      try {
        localStorage.setItem(`navbar_saved_${siteId}`, snapshot);
        localStorage.setItem('navbar_last_saved_siteId', siteId);
      } catch (e) {
        console.warn('Unable to write saved navbar to localStorage', e);
      }

      setSnackbarMessage("Navbar saved successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      return savedConfig;
    } catch (err: any) {
      console.error("saveNavbarConfig error:", err);
      setSnackbarMessage("Error saving: " + String(err.message || err));
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportNavbar = async () => {
    if (!isSaved) {
      setSnackbarMessage("Please save the navbar before preview");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }
    try {
      if (setSavedNavbarConfig) {
        setSavedNavbarConfig(exportData as NavbarConfig);
      }
      setSnackbarMessage("Navbar Published successfully! You can now view it in Your Layout page.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (e: any) {
      setSnackbarMessage("Export failed: " + String(e?.message || e));
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleResetNavbar = async () => {
    if (components.length === 0 && !savedConfigId) {
      setSnackbarMessage("Nothing to reset");
      setSnackbarSeverity("info");
      setSnackbarOpen(true);
      return;
    }

    const confirmReset = window.confirm(
      "Are you sure you want to reset? This will clear all components and saved data."
    );
    if (!confirmReset) return;

    setResettingNavbar(true);

    try {
      // Clean up preview URLs
      Object.values(previewUrlsRef.current).forEach((u) => {
        try { URL.revokeObjectURL(u); } catch {}
      });

      // Delete from server if saved
      if (savedConfigId) {
        await deleteNavbarConfigOnServer(savedConfigId);
        console.log("Deleted navbar config from server");
      }

      // Reset local state
      setPreviewUrls({});
      setPendingFiles({});
      setComponents([]);
      setSiteId("");
      setSiteIdError(false);
      setNavbarColor("#1976d2");
      setTheme("light");
      setNavbarStyle("none");
      setNavbarSize({ width: "100%", height: "60px" });
      setIsSaved(false);
      setSavedConfigId(null);
      setSavedConfigHash(null);

      // Clear localStorage
      try {
        const last = localStorage.getItem('navbar_last_saved_siteId');
        if (last) {
          localStorage.removeItem(`navbar_saved_${last}`);
          localStorage.removeItem('navbar_last_saved_siteId');
        }
      } catch (e) {
        console.warn('Failed to clear localStorage', e);
      }

      setSnackbarMessage("Navbar reset successfully! Ready to build a new one.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

    } catch (err: any) {
      console.error("Reset failed:", err);
      setSnackbarMessage("Reset failed: " + String(err.message || err));
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setResettingNavbar(false);
    }
  };

  useEffect(() => {
    const currentHash = JSON.stringify({
      siteId,
      components: displayComponents.map((c: any) => ({ type: c.type, position: c.position, config: c.config })),
      color: navbarColor, theme, style: navbarStyle, size: navbarSize, version: 1, published: false
    });
    setIsSaved(!!savedConfigHash && currentHash === savedConfigHash);
  }, [components, siteId, navbarColor, theme, navbarStyle, navbarSize, savedConfigHash, displayComponents]);

  const getNavbarWrapperStyles = (style: NavbarStyle) => {
    // FLAT navbar: transparent wrapper, no shadow, subtle bottom border
    const width = parseSize(navbarSize.width) || "100%";
    const height = parseSize(navbarSize.height) || "60px";

    const base: any = {
      width,
      height,
      margin: typeof width === "string" && width.endsWith("%") ? "0 auto" : "0 auto",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "transparent", // wrapper transparent so NavRenderer controls visual
      padding: 0,
      boxShadow: "none", // remove heavy shadow
      borderBottom: "1px solid rgba(0,0,0,0.06)", // subtle divider like real navbar
    };

    switch (style) {
      case "round":
        return { ...base, borderRadius: "8px", overflow: "hidden" };
      case "square":
        return { ...base, borderRadius: "0px", overflow: "hidden" };
      case "none":
      default:
        return { ...base, borderRadius: "0px", overflow: "hidden" };
    }
  };

  return (
    <Box sx={{ p: 4, minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#2c3e50", mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
          Navbar Builder
          {isSaved && <Chip label="Saved" size="small" color="success" sx={{ fontWeight: 600 }} />}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Design and customize your navigation bar - Now supports multiple logos!
        </Typography>
      </Box>

      {/* Configuration */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 600, color: "#34495e" }}>Configuration</Typography>
          <Grid container spacing={2.5}>
            <Grid >
              <TextField
                label="Site ID"
                value={siteId}
                onChange={(e) => { setSiteId(e.target.value); if (siteIdError) setSiteIdError(false); }}
                error={siteIdError}
                helperText={siteIdError ? "Site ID is required" : "Unique identifier for your site"}
                fullWidth required size="small"
              />
            </Grid>
            <Grid >
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <FormControl fullWidth size="small" sx={{ minWidth: 250 }}>
                  <InputLabel>Add Component</InputLabel>
                  <Select value={selected} label="Add Component" onChange={(e) => setSelected(e.target.value as any)} disabled={loadingComponents}>
                    <MenuItem value=""><em>Select component</em></MenuItem>
                    {availableComponents.map((c) => (
                      <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Tooltip title="Add component">
                  <span>
                    <Button variant="contained" onClick={addComponent} disabled={!selected} sx={{ minWidth: "auto", px: 2 }}>
                      <AddCircleOutlineIcon />
                    </Button>
                  </span>
                </Tooltip>
              </Box>
            </Grid>

            <Grid >
              <TextField
                label="Width"
                value={navbarSize.width}
                onChange={(e) => setNavbarSize((prev) => ({ ...prev, width: e.target.value }))}
                fullWidth
                size="small"
                helperText="e.g., 100%, 1200px"
              />
            </Grid>
            <Grid >
              <TextField
                label="Height"
                value={navbarSize.height}
                onChange={(e) => setNavbarSize((prev) => ({ ...prev, height: e.target.value }))}
                fullWidth
                size="small"
                helperText="e.g., 48px, 64px"
              />
            </Grid>

            <Grid  >
              <Button variant="outlined" startIcon={<ColorLensIcon />} onClick={() => { setPrevColor(navbarColor); setTempColor(navbarColor); setColorPickerOpen(true); }} size="small" fullWidth sx={{ height: "40px" }}>
                Choose Color
              </Button>
            </Grid>
            <Grid  >
              <FormControl fullWidth size="small">
                <InputLabel>Navbar Style</InputLabel>
                <Select value={navbarStyle} label="Navbar Style" onChange={(e) => setNavbarStyle(e.target.value as NavbarStyle)}>
                  {availableNavbarStyles.map((style) => (
                    <MenuItem key={style.value} value={style.value}>{style.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Components */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 600, color: "#34495e" }}>
            Components ({displayComponents.length})
          </Typography>

          {displayComponents.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center", backgroundColor: "#f8f9fa", borderRadius: 2, border: "2px dashed", borderColor: "divider" }}>
              <Typography color="text.secondary">
                No components added yet. Select a component above to get started.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {displayComponents.map((comp) => (
                <Fade in key={comp.id} timeout={300}>
                  <Card variant="outlined" sx={{ borderLeft: 4, borderLeftColor: comp.position === "left" ? "#3498db" : comp.position === "center" ? "#2ecc71" : "#e74c3c", "&:hover": { boxShadow: 2, transform: "translateY(-2px)", transition: "all 0.2s" } }}>
                    <CardContent>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Chip label={comp.type} size="small" sx={{ fontWeight: 600 }} />
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Position</InputLabel>
                            <Select value={comp.position} label="Position" onChange={(e) => handlePositionChange(comp.id, e.target.value as Position)}>
                              <MenuItem value="left">Left</MenuItem>
                              <MenuItem value="center">Center</MenuItem>
                              <MenuItem value="right">Right</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                        <Tooltip title="Remove component">
                          <IconButton color="error" onClick={() => removeComponent(comp.id)} size="small">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>

                      {/* Component-specific fields */}
                      <Box sx={{ mt: 2 }}>
                        {comp.type === "logo" && (
                          <Grid container spacing={2}>
                            <Grid ><TextField label="Image URL" fullWidth size="small" value={comp.config?.src || ""} onChange={(e) => updateComponent(comp.id, { config: { ...comp.config, src: e.target.value, serverId: undefined, logoId: undefined } })} placeholder="https://example.com/logo.png" /></Grid>
                            <Grid ><Button variant="outlined" component="label" fullWidth size="small">Upload Image<input type="file" hidden accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelectLocal(comp.id, f); }} /></Button></Grid>
                            <Grid ><TextField label="Alt Text" fullWidth size="small" value={comp.config?.alt || ""} onChange={(e) => updateComponent(comp.id, { config: { ...comp.config, alt: e.target.value } })} /></Grid>
                            {comp.config?.src && (
                              <Grid ><Box sx={{ p: 2, backgroundColor: "#f8f9fa", borderRadius: 1, display: "flex", justifyContent: "center" }}>
                                <img src={comp.config.src} alt="logo-preview" style={{ maxHeight: 60, maxWidth: "100%", objectFit: "contain" }} />
                              </Box></Grid>
                            )}
                          </Grid>
                        )}

                        {comp.type === "menuLinks" && (
                          <Box>
                            {(comp.config?.links || []).map((l: any) => (
                              <Box key={l.id} sx={{ display: "flex", gap: 1.5, mb: 1.5, p: 1.5, backgroundColor: "#f8f9fa", borderRadius: 1 }}>
                                <TextField label="Label" value={l.label} size="small" sx={{ flex: 1 }} onChange={(e) => updateMenuLink(comp.id, l.id, "label", e.target.value)} />
                                <TextField label="Path" value={l.path} size="small" sx={{ flex: 1 }} onChange={(e) => updateMenuLink(comp.id, l.id, "path", e.target.value)} />
                                <IconButton onClick={() => removeMenuLink(comp.id, l.id)} color="error" size="small"><DeleteIcon fontSize="small" /></IconButton>
                              </Box>
                            ))}
                            <Button onClick={() => addMenuLink(comp.id)} variant="outlined" size="small" fullWidth>Add Menu Item</Button>
                          </Box>
                        )}

                        {comp.type === "searchBar" && (
                          <TextField label="Search Placeholder" fullWidth size="small" value={comp.config?.placeholder || ""} onChange={(e) => updateComponent(comp.id, { config: { ...comp.config, placeholder: e.target.value } })} />
                        )}

                        {comp.type === "cartIcon" && (
                          <TextField label="Cart Count" fullWidth size="small" type="number" value={comp.config?.count || 0} onChange={(e) => updateComponent(comp.id, { config: { ...comp.config, count: parseInt(e.target.value) || 0 } })} />
                        )}

                        {comp.type === "profileIcon" && (
                          <Grid container spacing={2}>
                            <Grid ><TextField label="Avatar URL" fullWidth size="small" value={comp.config?.src || ""} onChange={(e) => updateComponent(comp.id, { config: { ...comp.config, src: e.target.value } })} /></Grid>
                            <Grid ><Button variant="outlined" component="label" fullWidth size="small">Upload Image<input type="file" hidden accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelectLocal(comp.id, f); }} /></Button></Grid>
                            <Grid ><TextField label="Initials" fullWidth size="small" value={comp.config?.initials || ""} onChange={(e) => updateComponent(comp.id, { config: { ...comp.config, initials: e.target.value } })} /></Grid>
                            <Grid ><TextField label="Login URL" fullWidth size="small" value={comp.config?.loginUrl || ""} onChange={(e) => updateComponent(comp.id, { config: { ...comp.config, loginUrl: e.target.value } })} /></Grid>
                            <Grid ><TextField label="Signup URL" fullWidth size="small" value={comp.config?.signupUrl || ""} onChange={(e) => updateComponent(comp.id, { config: { ...comp.config, signupUrl: e.target.value } })} /></Grid>
                            {comp.config?.src && (
                              <Grid ><Box sx={{ p: 2, backgroundColor: "#f8f9fa", borderRadius: 1, display: "flex", justifyContent: "center" }}>
                                <img src={comp.config.src} alt="avatar-preview" style={{ maxHeight: 60, maxWidth: 60, objectFit: "cover", borderRadius: "50%" }} />
                              </Box></Grid>
                            )}
                          </Grid>
                        )}

                        {comp.type === "themeToggle" && (
                          <FormControl fullWidth size="small">
                            <InputLabel>Theme</InputLabel>
                            <Select value={comp.config?.currentTheme || "light"} label="Theme" onChange={(e) => updateComponent(comp.id, { config: { ...comp.config, currentTheme: e.target.value as NavbarTheme } })}>
                              <MenuItem value="light">Light</MenuItem>
                              <MenuItem value="dark">Dark</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 600, color: "#34495e" }}>Live Preview</Typography>
          <Box sx={{ border: "2px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden", backgroundColor: "#fff", minHeight: "120px", height: "auto", display: "flex", justifyContent: "center", alignItems: "center", p: 3 }}>
            {/* wrapper uses flat styles so NavRenderer appears like a real navbar */}
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
              <Box sx={getNavbarWrapperStyles(navbarStyle)}>
                <NavRenderer
                  key={JSON.stringify({ ...exportData, ts: Date.now() })}
                  // Pass color and size so NavRenderer can style inner elements (links/logo) using color
                  config={{ siteId, components: displayComponents, version: 1, published: false, theme, color: navbarColor, style: navbarStyle, size: navbarSize } as ConfigWithStyle}
                  onThemeToggle={() => setTheme(theme === "light" ? "dark" : "light")}
                />
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid >
              <Button variant="contained" onClick={saveNavbarConfig} disabled={resettingNavbar || isSaving} fullWidth startIcon={<SaveIcon />} sx={{ py: 1.5, fontWeight: 600, boxShadow: 2, "&:hover": { boxShadow: 4 } }}>
                {isSaving ? "Saving..." : "Save Navbar"}
              </Button>
            </Grid>
            <Grid >
              <Button variant="contained" color="secondary" onClick={handleExportNavbar} disabled={resettingNavbar || isSaving} fullWidth startIcon={<VisibilityIcon />} sx={{ py: 1.5, fontWeight: 600, boxShadow: 2, "&:hover": { boxShadow: 4 } }}>
                Preview Navbar
              </Button>
            </Grid>
            <Grid >
              <Button variant="outlined" color="error" startIcon={<RestartAltIcon />} onClick={handleResetNavbar} disabled={resettingNavbar || isSaving} fullWidth sx={{ py: 1.5, fontWeight: 600 }}>
                {resettingNavbar ? "Clearing..." : "Clear All"}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Color Picker */}
      <Dialog open={colorPickerOpen} onClose={() => { setNavbarColor(prevColor); setTempColor(prevColor); setColorPickerOpen(false); }} PaperProps={{ sx: { borderRadius: 3, p: 2, maxWidth: 400, boxShadow: 5 } }}>
        <DialogTitle sx={{ textAlign: "center", fontWeight: 600 }}>Select Navbar Color</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 1 }}>
            <Box sx={{ width: 100, height: 50, borderRadius: 2, border: "3px solid", borderColor: "divider", backgroundColor: tempColor, mb: 3, boxShadow: 2, transition: "all 0.2s ease" }} />
            <ChromePicker color={tempColor} onChange={(c) => { setTempColor(c.hex); setNavbarColor(c.hex); }} disableAlpha />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2, gap: 1 }}>
          <Button onClick={() => { setNavbarColor(prevColor); setTempColor(prevColor); setColorPickerOpen(false); }} variant="outlined">Cancel</Button>
          <Button variant="contained" onClick={() => { setTempColor(navbarColor); setColorPickerOpen(false); }}>Apply</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%", boxShadow: 3, fontWeight: 500 }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
