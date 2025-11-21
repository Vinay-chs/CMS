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
  Paper,
  Divider,
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
  FormControlLabel,
  Checkbox,
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
const RETRY_COUNT = 2;

interface LogoPayload {
  src?: string;
  alt?: string;
  uploaded?: boolean;
  data?: string;
  contentType?: string;
  component?: { id: number };
  position?: Position;
}

interface CarticonPayload {
  componentId: string;
  badge?: number;
  showTotal?: boolean;
  position?: string;
}

interface CustomNavbarConfigPayload {
  userId: string;
  configName: string;
  siteId: string;
  slug?: string;
  jsonConfig: string;
  isActive: boolean;
}

interface NavbarCreationRequest {
  navbarConfig: CustomNavbarConfigPayload;
  logoPayloads: LogoPayload[];
  carticonPayload?: CarticonPayload;
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
}

const availableNavbarStyles: { value: NavbarStyle; label: string; description: string }[] = [
  { value: "none", label: "Default", description: "Clean minimal style" },
  { value: "round", label: "Rounded", description: "Soft rounded corners" },
  { value: "square", label: "Sharp", description: "Crisp square edges" },
];

function defaultPositionFor(type: NavbarComponentType): Position {
  switch (type) {
    case "logo":
    case "title":
    case "banner":
      return "left";
    case "menuLinks":
      return "center";
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

async function withRetry<T>(operation: () => Promise<T>, maxRetries: number = RETRY_COUNT): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (err: any) {
      if (i === maxRetries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error("Max retries exceeded");
}

export default function NavBuilder({ setSelectedModule, setSavedNavbarConfig }: PageProps) {
  const [components, setComponents] = useState<NavbarComponent[]>([]);
  const [selected, setSelected] = useState<NavbarComponentType | "">("");
  const [siteId, setSiteId] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [baseSlug, setBaseSlug] = useState<string>("");
  const [siteIdError, setSiteIdError] = useState(false);
  const [slugError, setSlugError] = useState(false);
  const [navbarColor, setNavbarColor] = useState<string>("#1976d2");
  const [theme, setTheme] = useState<NavbarTheme>("light");
  const [navbarStyle, setNavbarStyle] = useState<NavbarStyle>("none");
  const [availableComponents, setAvailableComponents] = useState<AvailableComponentLocal[]>([]);
  const [loadingComponents, setLoadingComponents] = useState(true);
  const [resettingNavbar, setResettingNavbar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

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

  // Load base slug from localStorage
  useEffect(() => {
    const savedBaseSlug = localStorage.getItem('cms_base_slug');
    if (savedBaseSlug) {
      setBaseSlug(savedBaseSlug);
    }
  }, []);

  // ✅ SLUG VALIDATION
  const validateSlug = (slug: string) => {
    return /^[a-z0-9-]+$/.test(slug);
  };

  // ✅ GET FULL SLUG
  const getFullSlug = (componentSlug: string) => {
    return `${baseSlug}/${componentSlug}`;
  };

  useEffect(() => {
    let mounted = true;
    const fetchComponents = async () => {
      setLoadingComponents(true);
      try {
        const res = await withRetry(() => fetch(`${BASE_URL}/uicomponent/get`));
        if (!res.ok) throw new Error("Failed to fetch components");
        const data = await res.json();
        const seen = new Set<string>();
        const formatted: AvailableComponentLocal[] = (data || [])
          .filter((comp: any) => comp && (comp.code || comp.display_name || comp.displayName || comp.id))
          .map((comp: any) => {
            const rawCode = (comp.code || "").trim();
            const fallback = rawCode || `component_${comp.id}`;
            const camelCaseCode = fallback.replace(/_([a-z])/g, (g: string) => g[1].toUpperCase());
            const label = comp.display_name || comp.displayName || fallback || `Component ${comp.id}`;
            return { id: comp.id, value: camelCaseCode, label, description: comp.description || "" } as AvailableComponentLocal;
          })
          .filter((c: AvailableComponentLocal) => {
            if (seen.has(c.value)) return false;
            seen.add(c.value);
            return true;
          });
        if (mounted) setAvailableComponents(formatted);
        setIsOffline(false);
      } catch (err) {
        console.error("Error fetching components:", err);
        if (mounted) setAvailableComponents([]);
        setIsOffline(true);
      } finally {
        if (mounted) setLoadingComponents(false);
      }
    };
    fetchComponents();
    return () => { mounted = false; };
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
            setSlug(parsed.slug || "");
            setComponents(parsed.components || []);
            setNavbarColor(parsed.color || '#1976d2');
            setTheme(parsed.theme || 'light');
            setNavbarStyle(parsed.style || 'none');
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

  const bulkDeleteLogoIds = async (ids: number[]) => {
    return withRetry(() => fetch(`${BASE_URL}/componentlogo/bulk-delete`, {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ ids }),
    }).then(res => {
      if (!res.ok) throw new Error(`bulk-delete failed ${res.status}: ${res.statusText}`);
      return res.json();
    }));
  };

  const deleteSingleLogoOnServer = async (logoId: number) => {
    return withRetry(() => fetch(`${BASE_URL}/componentlogo/delete/${logoId}`, {
      method: "DELETE", mode: "cors", headers: { Accept: "application/json" },
    }).then(res => {
      if (res.status === 404) throw new Error(`Not found id=${logoId}`);
      if (!res.ok) throw new Error(`delete failed ${res.status}: ${res.statusText}`);
      return res.json().catch(() => true);
    }));
  };

  const deleteCarticonOnServer = async (carticonId: string) => {
    return withRetry(() => fetch(`${BASE_URL}/componentcarticon/delete/${carticonId}`, {
      method: "DELETE", mode: "cors", headers: { Accept: "application/json" },
    }).then(res => {
      if (res.status === 404) throw new Error(`Not found id=${carticonId}`);
      if (!res.ok) throw new Error(`delete failed ${res.status}: ${res.statusText}`);
      return res.json().catch(() => true);
    }));
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
    if (components.some((c) => c.type === selected)) return;

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
          case "banner": return { src: "", alt: "Banner" };
          case "title": return { text: "Site Title", path: "/" };
          case "menuLinks": return { links: [{ id: uuid(), label: "Home", path: "/" }] };
          case "searchBar": return { placeholder: "Search..." };
          case "profileIcon": return { src: "", initials: "U" };
          case "ctaButton": return { text: "Sign Up", url: "/signup" };
          case "cartIcon": return { badge: 0, showTotal: false };
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

    const serverId = comp.config?.serverId;
    if (serverId) {
      const ok = window.confirm("Delete saved component from server and remove this component?");
      if (!ok) return;
      try {
        if (comp.type === "logo" || comp.type === "banner" || comp.type === "profileIcon") {
          await deleteSingleLogoOnServer(Number(serverId));
        } else if (comp.type === "cartIcon") {
          await deleteCarticonOnServer(serverId as string);
        }
        updateComponent(comp.id, { config: { ...comp.config, serverId: undefined } });
        setSnackbarMessage("Component removed successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } catch (err: any) {
        console.error("removeComponent delete error:", err);
        updateComponent(comp.id, { config: { ...comp.config, serverId: undefined } });
        setSnackbarMessage(`Failed to delete from server: ${err.message}. Removed locally.`);
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
      }
    } else {
      const ok = window.confirm("Remove this component?");
      if (!ok) return;
      setSnackbarMessage("Component removed");
      setSnackbarSeverity("info");
      setSnackbarOpen(true);
    }

    const url = previewUrlsRef.current[id];
    if (url) { URL.revokeObjectURL(url); setPreviewUrls((p) => { const copy = {...p}; delete copy[id]; return copy; }); }
    setPendingFiles((p) => { const copy = {...p}; delete copy[id]; return copy; });

    setComponents((prev) => prev.filter((p) => p.id !== id));
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

  const exportData: ConfigWithStyle & { slug?: string } = { 
    siteId, 
    slug: getFullSlug(slug), // ✅ FULL SLUG WITH BASE
    components: displayComponents, 
    color: navbarColor, 
    theme, 
    style: navbarStyle, 
    version: 1, 
    published: false 
  };

  const saveNavbarConfig = async (): Promise<any | null> => {
    console.log("Saved navbar data...", exportData);
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

      // ✅ SLUG VALIDATION
      if (!slug.trim()) {
        setSlugError(true);
        setSnackbarMessage("Navbar Slug is required");
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
        setIsSaving(false);
        return null;
      }

      if (!validateSlug(slug)) {
        setSlugError(true);
        setSnackbarMessage("Slug can only contain lowercase letters, numbers, and hyphens");
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
        setIsSaving(false);
        return null;
      }

      setSiteIdError(false);
      setSlugError(false);

      const currentSnapshotObj = { 
        siteId, 
        slug: getFullSlug(slug), // ✅ FULL SLUG WITH BASE
        components: components.map((c: any) => ({ type: c.type, position: c.position, config: c.config })), 
        color: navbarColor, 
        theme, 
        style: navbarStyle, 
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

      if (components.length === 0) {
        setSnackbarMessage("Please add at least one component");
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
        setIsSaving(false);
        return null;
      }

      const logoComp = components.find((c) => c.type === "logo");
      let logoPayload: LogoPayload | undefined = undefined;
      if (logoComp) {
        const logoFile = pendingFiles[logoComp.id];
        const logoCfg = logoComp.config || {};
        const backendComponentId = (logoComp as any).componentId;

        logoPayload = { alt: logoCfg.alt, component: backendComponentId ? { id: backendComponentId } : undefined, position: logoComp.position };

        if (logoFile) {
          const base64String = await fileToBase64(logoFile);
          logoPayload = { ...logoPayload, src: base64String, uploaded: true, contentType: logoFile.type };
        } else if (logoCfg.src && typeof logoCfg.src === "string" && logoCfg.src.startsWith("http")) {
          logoPayload = { ...logoPayload, src: logoCfg.src, uploaded: false };
        } else if (logoCfg.serverId) {
          logoPayload = { ...logoPayload, src: logoCfg.src, uploaded: false };
        }
      }

      const carticonComp = components.find((c) => c.type === "cartIcon");
      let carticonPayload: CarticonPayload | undefined = undefined;
      if (carticonComp) {
        const carticonCfg = carticonComp.config || {};
        carticonPayload = {
          componentId: (carticonCfg.serverId as string) || uuid(),
          badge: carticonCfg.badge || 0,
          showTotal: carticonCfg.showTotal || false,
          position: carticonComp.position.toUpperCase(),
        };
      }

      const customNavbarConfigPayload: CustomNavbarConfigPayload = {
        userId: uuid(),
        configName: `Navbar-${siteId}-${new Date().toISOString()}`,
        siteId: siteId,
        slug: getFullSlug(slug), // ✅ FULL SLUG WITH BASE
        jsonConfig: JSON.stringify(currentSnapshotObj),
        isActive: true,
      };
      const combinedRequest: NavbarCreationRequest = { 
        navbarConfig: customNavbarConfigPayload, 
        logoPayloads: logoPayload ? [logoPayload] : [],
        carticonPayload,
      };

      const res = await withRetry(() => fetch(`${BASE_URL}/custom-navbar-config/create`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(combinedRequest),
      }));
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        const errorMessage = errorBody.message || res.statusText || "Unknown error";
        if (res.status === 400) {
          setSnackbarMessage("Configuration may already exist on server");
          setSnackbarSeverity("warning");
          setSnackbarOpen(true);
          setIsSaving(false);
          return null;
        }
        throw new Error(`Save failed: ${res.status}: ${errorMessage}`);
      }

      const savedConfig = await res.json();
      const newLogoId = savedConfig.logoComponentId;

      let updatedComponents = components.map((c) => {
        if (c.id === logoComp?.id) {
          return { ...c, config: { ...c.config, serverId: newLogoId, src: `${BASE_URL}/componentlogo/${newLogoId}` } };
        }
        return c;
      });

      if (carticonComp && savedConfig.navbarConfig.carticonComponent) {
        const newCarticonId = savedConfig.navbarConfig.carticonComponent.componentId;
        updatedComponents = updatedComponents.map((c) => {
          if (c.id === carticonComp.id) {
            return { ...c, config: { ...c.config, serverId: newCarticonId } };
          }
          return c;
        });
      }

      setComponents(updatedComponents);

      if (logoComp && pendingFiles[logoComp.id]) {
        const prev = previewUrls[logoComp.id];
        if (prev) { try { URL.revokeObjectURL(prev); } catch {} }
        setPreviewUrls((p) => { const copy = {...p}; delete copy[logoComp.id]; return copy; });
        setPendingFiles((p) => { const copy = {...p}; delete copy[logoComp.id]; return copy; });
      }

      const snapshotObj = { 
        siteId, 
        slug: getFullSlug(slug), // ✅ FULL SLUG WITH BASE
        components: updatedComponents.map((c: any) => ({ type: c.type, position: c.position, config: c.config })), 
        color: navbarColor, 
        theme, 
        style: navbarStyle, 
        version: 1, 
        published: false 
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

      setSnackbarMessage(`Navbar saved successfully with full slug: ${getFullSlug(slug)}`);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      return savedConfig;
    } catch (err: any) {
      console.error("saveNavbarConfig error:", err);
      setSnackbarMessage(`Error saving: ${err.message}. Please check server connection.`);
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
      setSnackbarMessage(`Navbar Published successfully with slug: ${getFullSlug(slug)}! You can now view it in Your Layout page.`);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (e: any) {
      setSnackbarMessage("Export failed: " + String(e?.message || e));
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleResetNavbar = async () => {
    setResettingNavbar(true);
    const logoIds: number[] = components
      .map((c: any) => c?.config?.serverId)
      .filter((id): id is number => typeof id === "number" && id !== undefined);
    const carticonIds: string[] = components
      .filter(c => c.type === "cartIcon")
      .map((c: any) => c?.config?.serverId)
      .filter((id): id is string => typeof id === "string" && id !== undefined);

    try {
      if (savedConfigId && !isOffline) {
        const deleteConfigRes = await withRetry(() => fetch(`${BASE_URL}/custom-navbar-config/delete/${savedConfigId}`, {
          method: "DELETE",
          mode: "cors",
          headers: { Accept: "application/json" },
        }));
        if (!deleteConfigRes.ok) {
          const txt = await deleteConfigRes.text().catch(() => deleteConfigRes.statusText || "");
          throw new Error(`Config delete failed ${deleteConfigRes.status}: ${txt}`);
        }
      }

      if (!isOffline) {
        if (logoIds.length > 0) {
          await bulkDeleteLogoIds(logoIds).catch(async (bulkErr) => {
            console.warn("bulk delete failed, trying individual deletes", bulkErr);
            for (const id of logoIds) {
              try { await deleteSingleLogoOnServer(id); } catch (e) { console.error(`Failed to delete logo ${id}:`, e); }
            }
          });
        }
        for (const id of carticonIds) {
          try { await deleteCarticonOnServer(id); } catch (e) { console.error(`Failed to delete carticon ${id}:`, e); }
        }
      }

      // Local reset
      Object.values(previewUrlsRef.current).forEach((u) => { try { URL.revokeObjectURL(u); } catch {} });
      setPreviewUrls({});
      setPendingFiles({});
      setComponents([]);
      setSiteId("");
      setSlug("");
      setSiteIdError(false);
      setSlugError(false);
      setNavbarColor("#1976d2");
      setTheme("light");
      setNavbarStyle("none");
      setIsSaved(false);
      setSavedConfigId(null);
      setSavedConfigHash(null);

      if (setSavedNavbarConfig) {
        setSavedNavbarConfig({ siteId: "", components: [], color: "#1976d2", theme: "light", version: 1, published: false } as NavbarConfig);
      }

      try {
        const last = localStorage.getItem('navbar_last_saved_siteId');
        if (last) {
          localStorage.removeItem(`navbar_saved_${last}`);
          localStorage.removeItem('navbar_last_saved_siteId');
        }
        localStorage.removeItem('yourLayout_navbar_config');
      } catch (e) {
        console.warn('Unable to remove saved navbar from localStorage', e);
      }

      setSnackbarMessage("Navbar reset successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err: any) {
      console.error("Reset failed:", err);
      // Fallback to local reset on error
      Object.values(previewUrlsRef.current).forEach((u) => { try { URL.revokeObjectURL(u); } catch {} });
      setPreviewUrls({});
      setPendingFiles({});
      setComponents([]);
      setSiteId("");
      setSlug("");
      setSiteIdError(false);
      setSlugError(false);
      setNavbarColor("#1976d2");
      setTheme("light");
      setNavbarStyle("none");
      setIsSaved(false);
      setSavedConfigId(null);
      setSavedConfigHash(null);
      if (setSavedNavbarConfig) {
        setSavedNavbarConfig({ siteId: "", components: [], color: "#1976d2", theme: "light", version: 1, published: false } as NavbarConfig);
      }
      setSnackbarMessage(`Reset failed: ${err.message}. Reset performed locally.`);
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
    } finally {
      setResettingNavbar(false);
    }
  };

  useEffect(() => {
    const currentHash = JSON.stringify({ 
      siteId, 
      slug: getFullSlug(slug), // ✅ FULL SLUG WITH BASE
      components: displayComponents.map((c: any) => ({ type: c.type, position: c.position, config: c.config })), 
      color: navbarColor, 
      theme, 
      style: navbarStyle, 
      version: 1, 
      published: false 
    });
    if (savedConfigHash && currentHash === savedConfigHash) {
      setIsSaved(true);
    } else {
      setIsSaved(false);
    }
  }, [components, siteId, slug, navbarColor, theme, navbarStyle, pendingFiles]);

  const getNavbarWrapperStyles = (style: NavbarStyle) => {
    const base: any = { backgroundColor: "transparent", padding: 0, width: "100%", boxSizing: "border-box" };
    switch (style) {
      case "round":
        return { ...base, borderRadius: '16px', overflow: 'hidden', display: 'block' };
      case "square":
        return { ...base, borderRadius: '0px', overflow: 'hidden', display: 'block' };
      case "none":
      default:
        return { ...base, borderRadius: '0px', margin: '0', overflow: 'hidden', display: 'block' };
    }
  };

  return (
    <Box sx={{ 
      p: 4, 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            color: '#2c3e50',
            mb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          Navbar Builder
          {isSaved && (
            <Chip 
              label="Saved" 
              size="small" 
              color="success" 
              sx={{ fontWeight: 600 }}
            />
          )}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Design and customize your navigation bar with slug support
        </Typography>
        
        {/* Base Slug Info */}
        {baseSlug && (
          <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              🎯 Base Website Slug: {baseSlug}
            </Typography>
            <Typography variant="body2">
              Your navbar will be saved under: <strong>/{baseSlug}/your-navbar-slug</strong>
            </Typography>
          </Alert>
        )}
      </Box>

      {/* Configuration Section */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 600, color: '#34495e' }}>
            Configuration
          </Typography>
          
          <Grid container spacing={2.5}>
            <Grid  >
              <TextField
                label="Site ID"
                value={siteId}
                onChange={(e) => { setSiteId(e.target.value); if (siteIdError) setSiteIdError(false); }}
                error={siteIdError}
                helperText={siteIdError ? "Site ID is required" : "Unique identifier for your site"}
                fullWidth
                required
                size="small"
              />
            </Grid>

            {/* ✅ SLUG FIELD WITH BASE SLUG DISPLAY */}
            <Grid  >
              <TextField
                label="Navbar Slug *"
                value={slug}
                onChange={(e) => { 
                  setSlug(e.target.value); 
                  if (slugError) setSlugError(false); 
                }}
                error={slugError}
                helperText={
                  slugError ? "Invalid slug format" : 
                  baseSlug ? `Full URL: /${baseSlug}/${slug || 'your-slug'}` : 
                  "URL-friendly name (e.g., header, main-nav)"
                }
                fullWidth
                required
                size="small"
                placeholder="header"
              />
            </Grid>

            <Grid  >
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <FormControl fullWidth size="small" sx={{ minWidth: 250 }}>
                  <InputLabel>Add Component</InputLabel>
                  <Select
                    value={selected}
                    label="Add Component"
                    onChange={(e) => setSelected(e.target.value as any)}
                    disabled={loadingComponents}
                  >
                    <MenuItem value=""><em>Select component</em></MenuItem>
                    {availableComponents.map((c) => (
                      <MenuItem 
                        key={c.value} 
                        value={c.value} 
                        disabled={components.some((x) => x.type === c.value)}
                      >
                        {c.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Tooltip title="Add component">
                  <span>
                    <Button 
                      variant="contained" 
                      onClick={addComponent} 
                      disabled={!selected}
                      sx={{ minWidth: 'auto', px: 2 }}
                    >
                      <AddCircleOutlineIcon />
                    </Button>
                  </span>
                </Tooltip>
              </Box>
            </Grid>

            <Grid  >
              <Button 
                variant="outlined" 
                startIcon={<ColorLensIcon />}
                onClick={() => { 
                  setPrevColor(navbarColor); 
                  setTempColor(navbarColor); 
                  setColorPickerOpen(true); 
                }}
                size="small"
                fullWidth
                sx={{ height: '40px' }}
              >
                Choose Color
              </Button>
            </Grid>

            <Grid  >
              <FormControl fullWidth size="small">
                <InputLabel>Navbar Style</InputLabel>
                <Select 
                  value={navbarStyle} 
                  label="Navbar Style"
                  onChange={(e) => setNavbarStyle(e.target.value as NavbarStyle)}
                >
                  {availableNavbarStyles.map((style) => (
                    <MenuItem key={style.value} value={style.value}>
                      {style.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Components Section */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 600, color: '#34495e' }}>
            Components ({displayComponents.length})
          </Typography>
          
          {displayComponents.length === 0 ? (
            <Box sx={{ 
              p: 4, 
              textAlign: 'center',
              backgroundColor: '#f8f9fa',
              borderRadius: 2,
              border: '2px dashed',
              borderColor: 'divider'
            }}>
              <Typography color="text.secondary">
                No components added yet. Select a component above to get started.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {displayComponents.map((comp, index) => (
                <Fade in key={comp.id} timeout={300}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      borderLeft: 4,
                      borderLeftColor: comp.position === 'left' ? '#3498db' : comp.position === 'center' ? '#2ecc71' : '#e74c3c',
                      '&:hover': {
                        boxShadow: 2,
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s'
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Chip 
                            label={comp.type} 
                            size="small" 
                            sx={{ fontWeight: 600 }}
                          />
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Position</InputLabel>
                            <Select 
                              value={comp.position} 
                              label="Position"
                              onChange={(e) => handlePositionChange(comp.id, e.target.value as Position)}
                            >
                              <MenuItem value="left">Left</MenuItem>
                              <MenuItem value="center">Center</MenuItem>
                              <MenuItem value="right">Right</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                        
                        <Tooltip title="Remove component">
                          <IconButton 
                            color="error" 
                            onClick={() => removeComponent(comp.id)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>

                      {/* Component-specific fields */}
                      <Box sx={{ mt: 2 }}>
                        {comp.type === "logo" && (
                          <Grid container spacing={2}>
                            <Grid  >
                              <TextField
                                label="Image URL"
                                fullWidth
                                size="small"
                                value={comp.config?.src || ""}
                                onChange={(e) => updateComponent(comp.id, { 
                                  config: { ...comp.config, src: e.target.value, serverId: undefined, logoId: undefined } 
                                })}
                                placeholder="https://example.com/logo.png"
                              />
                            </Grid>
                            <Grid  >
                              <Button 
                                variant="outlined" 
                                component="label" 
                                fullWidth
                                size="small"
                              >
                                Upload Image
                                <input 
                                  type="file" 
                                  hidden 
                                  accept="image/*" 
                                  onChange={(e) => { 
                                    const f = e.target.files?.[0]; 
                                    if (f) handleFileSelectLocal(comp.id, f); 
                                  }} 
                                />
                              </Button>
                            </Grid>
                            <Grid  >
                              <TextField
                                label="Alt Text"
                                fullWidth
                                size="small"
                                value={comp.config?.alt || ""}
                                onChange={(e) => updateComponent(comp.id, { 
                                  config: { ...comp.config, alt: e.target.value } 
                                })}
                              />
                            </Grid>
                            {comp.config?.src && (
                              <Grid  >
                                <Box sx={{ 
                                  p: 2, 
                                  backgroundColor: '#f8f9fa', 
                                  borderRadius: 1,
                                  display: 'flex',
                                  justifyContent: 'center'
                                }}>
                                  <img 
                                    src={comp.config.src} 
                                    alt="logo-preview" 
                                    style={{ 
                                      maxHeight: 60, 
                                      maxWidth: '100%', 
                                      objectFit: 'contain' 
                                    }} 
                                  />
                                </Box>
                              </Grid>
                            )}
                          </Grid>
                        )}

                        {comp.type === "menuLinks" && (
                          <Box>
                            {(comp.config?.links || []).map((l: any, idx: number) => (
                              <Box 
                                key={l.id} 
                                sx={{ 
                                  display: 'flex', 
                                  gap: 1.5, 
                                  mb: 1.5,
                                  p: 1.5,
                                  backgroundColor: '#f8f9fa',
                                  borderRadius: 1
                                }}
                              >
                                <TextField
                                  label="Label"
                                  value={l.label}
                                  size="small"
                                  sx={{ flex: 1 }}
                                  onChange={(e) => updateMenuLink(comp.id, l.id, "label", e.target.value)}
                                />
                                <TextField
                                  label="Path"
                                  value={l.path}
                                  size="small"
                                  sx={{ flex: 1 }}
                                  onChange={(e) => updateMenuLink(comp.id, l.id, "path", e.target.value)}
                                />
                                <IconButton 
                                  onClick={() => removeMenuLink(comp.id, l.id)}
                                  color="error"
                                  size="small"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            ))}

                            <Button 
                              onClick={() => addMenuLink(comp.id)} 
                              variant="outlined"
                              size="small"
                              fullWidth
                            >
                              Add Menu Item
                            </Button>
                          </Box>
                        )}

                        {comp.type === "banner" && (
                          <Grid container spacing={2}>
                            <Grid  >
                              <TextField
                                label="Banner URL"
                                fullWidth
                                size="small"
                                value={comp.config?.src || ""}
                                onChange={(e) => updateComponent(comp.id, { 
                                  config: { ...comp.config, src: e.target.value } 
                                })}
                              />
                            </Grid>
                            <Grid  >
                              <Button 
                                variant="outlined" 
                                component="label" 
                                fullWidth
                                size="small"
                              >
                                Upload Image
                                <input 
                                  type="file" 
                                  hidden 
                                  accept="image/*" 
                                  onChange={(e) => { 
                                    const f = e.target.files?.[0]; 
                                    if (f) handleFileSelectLocal(comp.id, f); 
                                  }} 
                                />
                              </Button>
                            </Grid>
                            <Grid  >
                              <TextField
                                label="Alt Text"
                                fullWidth
                                size="small"
                                value={comp.config?.alt || ""}
                                onChange={(e) => updateComponent(comp.id, { 
                                  config: { ...comp.config, alt: e.target.value } 
                                })}
                              />
                            </Grid>
                            {comp.config?.src && (
                              <Grid  >
                                <Box sx={{ 
                                  p: 2, 
                                  backgroundColor: '#f8f9fa', 
                                  borderRadius: 1,
                                  display: 'flex',
                                  justifyContent: 'center'
                                }}>
                                  <img 
                                    src={comp.config.src} 
                                    alt="banner-preview" 
                                    style={{ 
                                      maxHeight: 60, 
                                      maxWidth: '100%', 
                                      objectFit: 'contain' 
                                    }} 
                                  />
                                </Box>
                              </Grid>
                            )}
                          </Grid>
                        )}

                        {comp.type === "profileIcon" && (
                          <Grid container spacing={2}>
                            <Grid  >
                              <TextField
                                label="Avatar URL"
                                fullWidth
                                size="small"
                                value={comp.config?.src || ""}
                                onChange={(e) => updateComponent(comp.id, { 
                                  config: { ...comp.config, src: e.target.value } 
                                })}
                              />
                            </Grid>
                            <Grid  >
                              <Button 
                                variant="outlined" 
                                component="label" 
                                fullWidth
                                size="small"
                              >
                                Upload Image
                                <input 
                                  type="file" 
                                  hidden 
                                  accept="image/*" 
                                  onChange={(e) => { 
                                    const f = e.target.files?.[0]; 
                                    if (f) handleFileSelectLocal(comp.id, f); 
                                  }} 
                                />
                              </Button>
                            </Grid>
                            <Grid  >
                              <TextField
                                label="Initials"
                                fullWidth
                                size="small"
                                value={comp.config?.initials || ""}
                                onChange={(e) => updateComponent(comp.id, { 
                                  config: { ...comp.config, initials: e.target.value } 
                                })}
                              />
                            </Grid>
                            {comp.config?.src && (
                              <Grid  >
                                <Box sx={{ 
                                  p: 2, 
                                  backgroundColor: '#f8f9fa', 
                                  borderRadius: 1,
                                  display: 'flex',
                                  justifyContent: 'center'
                                }}>
                                  <img 
                                    src={comp.config.src} 
                                    alt="avatar-preview" 
                                    style={{ 
                                      maxHeight: 60, 
                                      maxWidth: 60, 
                                      objectFit: 'cover',
                                      borderRadius: '50%'
                                    }} 
                                  />
                                </Box>
                              </Grid>
                            )}
                          </Grid>
                        )}

                        {comp.type === "title" && (
                          <Grid container spacing={2}>
                            <Grid  >
                              <TextField
                                label="Title Text"
                                fullWidth
                                size="small"
                                value={comp.config?.text || ""}
                                onChange={(e) => updateComponent(comp.id, { 
                                  config: { ...comp.config, text: e.target.value } 
                                })}
                              />
                            </Grid>
                            <Grid  >
                              <TextField
                                label="Link URL"
                                fullWidth
                                size="small"
                                value={comp.config?.link || ""}
                                onChange={(e) => updateComponent(comp.id, { 
                                  config: { ...comp.config, link: e.target.value } 
                                })}
                                placeholder="/"
                              />
                            </Grid>
                          </Grid>
                        )}

                        {comp.type === "ctaButton" && (
                          <Grid container spacing={2}>
                            <Grid  >
                              <TextField
                                label="Button Text"
                                fullWidth
                                size="small"
                                value={comp.config?.text || ""}
                                onChange={(e) => updateComponent(comp.id, { 
                                  config: { ...comp.config, text: e.target.value } 
                                })}
                              />
                            </Grid>
                            <Grid  >
                              <TextField
                                label="URL"
                                fullWidth
                                size="small"
                                value={comp.config?.url || ""}
                                onChange={(e) => updateComponent(comp.id, { 
                                  config: { ...comp.config, url: e.target.value } 
                                })}
                              />
                            </Grid>
                          </Grid>
                        )}

                        {comp.type === "searchBar" && (
                          <TextField
                            label="Search Placeholder"
                            fullWidth
                            size="small"
                            value={comp.config?.placeholder || ""}
                            onChange={(e) => updateComponent(comp.id, { 
                              config: { ...comp.config, placeholder: e.target.value } 
                            })}
                          />
                        )}

                        {comp.type === "cartIcon" && (
                          <Grid container spacing={2}>
                            <Grid  >
                              <TextField
                                label="Badge Count"
                                fullWidth
                                size="small"
                                type="number"
                                value={comp.config?.badge || 0}
                                onChange={(e) => updateComponent(comp.id, { 
                                  config: { ...comp.config, badge: Number(e.target.value) } 
                                })}
                              />
                            </Grid>
                            <Grid  >
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={comp.config?.showTotal || false}
                                    onChange={(e) => updateComponent(comp.id, { 
                                      config: { ...comp.config, showTotal: e.target.checked } 
                                    })}
                                  />
                                }
                                label="Show Total"
                              />
                            </Grid>
                          </Grid>
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

      {/* Live Preview Section */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 600, color: '#34495e' }}>
            Live Preview {slug && `- Full Slug: /${baseSlug}/${slug}`}
          </Typography>
          
          <Box
            sx={{
              border: '2px solid',
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden',
              backgroundColor: '#fff',
              transition: 'all 0.3s ease-in-out',
              ...getNavbarWrapperStyles(navbarStyle),
            }}
          >
            <NavRenderer
              key={JSON.stringify(displayComponents.map(c => ({id: c.id, pos: c.position})) + navbarStyle + navbarColor)}
              config={{ 
                siteId, 
                components: displayComponents, 
                version: 1, 
                published: false, 
                theme, 
                color: navbarColor, 
                style: navbarStyle 
              } as ConfigWithStyle}
              onThemeToggle={() => {}}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid  >
              <Button 
                variant="contained" 
                onClick={saveNavbarConfig} 
                disabled={resettingNavbar || isSaving}
                fullWidth
                startIcon={<SaveIcon />}
                sx={{ 
                  py: 1.5,
                  fontWeight: 600,
                  boxShadow: 2,
                  '&:hover': { boxShadow: 4 }
                }}
              >
                {isSaving ? "Saving..." : "Save Navbar"}
              </Button>
            </Grid>

            <Grid  >
              <Button 
                variant="contained" 
                color="secondary"
                onClick={handleExportNavbar} 
                disabled={resettingNavbar || isSaving}
                fullWidth
                startIcon={<VisibilityIcon />}
                sx={{ 
                  py: 1.5,
                  fontWeight: 600,
                  boxShadow: 2,
                  '&:hover': { boxShadow: 4 }
                }}
              >
                Preview Navbar
              </Button>
            </Grid>

            <Grid  >
              <Button 
                variant="outlined" 
                color="error"
                startIcon={<RestartAltIcon />} 
                onClick={handleResetNavbar} 
                disabled={resettingNavbar || isSaving}
                fullWidth
                sx={{ py: 1.5, fontWeight: 600 }}
              >
                {resettingNavbar ? "Resetting..." : "Reset"}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Color Picker Dialog */}
      <Dialog 
        open={colorPickerOpen} 
        onClose={() => { 
          setNavbarColor(prevColor); 
          setTempColor(prevColor); 
          setColorPickerOpen(false); 
        }}
        PaperProps={{ 
          sx: { 
            borderRadius: 3, 
            p: 2, 
            maxWidth: 400,
            boxShadow: 5
          } 
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 600 }}>
          Select Navbar Color
        </DialogTitle>
        <DialogContent>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            mt: 1 
          }}>
            <Box sx={{ 
              width: 100, 
              height: 50, 
              borderRadius: 2, 
              border: '3px solid', 
              borderColor: 'divider',
              backgroundColor: tempColor, 
              mb: 3, 
              boxShadow: 2,
              transition: 'all 0.2s ease'
            }} />
            <ChromePicker 
              color={tempColor} 
              onChange={(c) => { 
                setTempColor(c.hex); 
                setNavbarColor(c.hex); 
              }} 
              disableAlpha 
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2, gap: 1 }}>
          <Button 
            onClick={() => { 
              setNavbarColor(prevColor); 
              setTempColor(prevColor); 
              setColorPickerOpen(false); 
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={() => { 
              setTempColor(navbarColor); 
              setColorPickerOpen(false); 
            }}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          sx={{ 
            width: '100%',
            boxShadow: 3,
            fontWeight: 500
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}