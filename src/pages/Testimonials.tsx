// src/pages/Testimonials.tsx
import React, { JSX, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import {
  ArrowDownward,
  ArrowUpward,
  ContentCopy,
  Delete,
  Edit,
  FileUpload,
  Save,
} from "@mui/icons-material";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export type TestimonialItem = {
  id: string;
  name: string;
  position?: string;
  company?: string;
  text: string;
  image?: string;
  rating?: number; // optional
  orderIndex?: number;
  isActive?: boolean;
  imageMediaId?: number | null;
};

const STYLE_OPTIONS = [
  { key: "styleA", label: "Style A — Big centered card (image top, quote box)" },
  { key: "styleB", label: "Style B — Purple slider cards (3 across)" },
  { key: "styleC", label: "Style C — Row cards with avatar overlap" },
  { key: "styleD", label: "Style D — Minimal white cards with quote" },
  { key: "styleE", label: "Style E — Dark gradient rounded cards" },
  { key: "styleF", label: "Style F — Blue brand cards" },
];

const STORAGE_KEYS = {
  items: "mwa_testimonials_v1",
  preset: "mwa_testimonials_preset_v1",
  slider: "mwa_testimonials_slider_enabled_v1",
  swiper: "mwa_testimonials_swiper_enabled_v1",
  loop: "mwa_testimonials_loop_enabled_v1",
  interval: "mwa_testimonials_interval_v1_seconds",
  ratingMap: "mwa_testimonials_rating_enabled_map_v1",
};

// Edit this if backend base is different, or set REACT_APP_API_BASE env var
const API_BASE = (process.env.REACT_APP_API_BASE || "http://localhost:8080/api/testimonials").replace(/\/$/, "");

export default function TestimonialsBuilderMUI(): JSX.Element {
  const [items, setItems] = useState<TestimonialItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.items);
      return raw ? (JSON.parse(raw) as TestimonialItem[]) : [];
    } catch {
      return [];
    }
  });

  const [preset, setPreset] = useState<string>(() => localStorage.getItem(STORAGE_KEYS.preset) || "styleA");
  const [sliderEnabled, setSliderEnabled] = useState<boolean>(() => localStorage.getItem(STORAGE_KEYS.slider) === "1");
  const [swiperEnabled, setSwiperEnabled] = useState<boolean>(() => localStorage.getItem(STORAGE_KEYS.swiper) === "1");
  const [loopEnabled, setLoopEnabled] = useState<boolean>(() => localStorage.getItem(STORAGE_KEYS.loop) === "1");

  const [intervalSec, setIntervalSec] = useState<number>(() => {
    const v = Number(localStorage.getItem(STORAGE_KEYS.interval) || "4");
    return Number.isFinite(v) && v >= 1 && v <= 10 ? Math.round(v) : 4;
  });

  const [ratingEnabledMap, setRatingEnabledMap] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ratingMap);
      return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    } catch {
      return {};
    }
  });

  // form.rating is number | null so default is null (empty)
  const [form, setForm] = useState({
    name: "",
    position: "",
    company: "",
    text: "",
    file: null as File | null,
    imageUrl: "",
    rating: null as number | null,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [saving, setSaving] = useState(false);
  const [loadingServer, setLoadingServer] = useState(false);

  // persist local UI cache for offline / UX
  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.items, JSON.stringify(items));
  }, [items]);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.preset, preset);
  }, [preset]);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.slider, sliderEnabled ? "1" : "0");
  }, [sliderEnabled]);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.swiper, swiperEnabled ? "1" : "0");
  }, [swiperEnabled]);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.loop, loopEnabled ? "1" : "0");
  }, [loopEnabled]);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.interval, String(intervalSec));
  }, [intervalSec]);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ratingMap, JSON.stringify(ratingEnabledMap));
  }, [ratingEnabledMap]);

  // helper: map server item -> local TestimonialItem
  function mapServerToLocal(si: any): TestimonialItem {
    return {
      id: String(si.id ?? (si._id ?? Date.now())),
      name: si.name ?? "",
      position: si.position ?? "",
      company: si.company ?? "",
      text: si.text ?? "",
      // server uses imageUrl; local UI uses image
      image: si.imageUrl ?? si.image ?? "",
      rating: si.rating ?? undefined,
      orderIndex: si.orderIndex ?? 0,
      isActive: si.isActive ?? true,
      imageMediaId: si.imageMediaId ?? null,
    };
  }

  // helper: map local item -> server payload shape
  function mapLocalToServerPayload(item: TestimonialItem) {
    const payload: any = {
      id: item.id,
      name: item.name,
      position: item.position,
      company: item.company,
      text: item.text,
      imageUrl: item.image, // backend expects imageUrl
      orderIndex: item.orderIndex ?? 0,
      isActive: item.isActive ?? true,
      createdBy: "frontend",
      imageMediaId: item.imageMediaId ?? null,
    };
    if (item.rating != null) payload.rating = item.rating;
    return payload;
  }

  // NOTE: No automatic fetch on mount — use manual load button
  async function safeText(res: Response) {
    try {
      return await res.text();
    } catch {
      return "";
    }
  }

  // Manual load: fetch settings and items only when user clicks
  async function loadFromServer() {
    setLoadingServer(true);
    try {
      const settingsUrl = `${API_BASE}/settings?tenantId=default`.replace(/\/{2,}/g, "/").replace("http:/", "http://");
      const settingsRes = await fetch(settingsUrl);
      if (settingsRes.ok) {
        const s = await settingsRes.json();
        setPreset(s.templateKey || "styleA");
        setSliderEnabled(!!s.sliderEnabled);
        setSwiperEnabled(!!s.swiperEnabled);
        setLoopEnabled(!!s.loopEnabled);
        setIntervalSec(Number.isFinite(Number(s.intervalSeconds)) ? s.intervalSeconds : 4);
        try {
          const map = s.ratingEnabledMap ? JSON.parse(s.ratingEnabledMap) : {};
          setRatingEnabledMap(map);
        } catch {
          setRatingEnabledMap({});
        }
      } else {
        console.warn("Failed to load settings:", settingsRes.status, await safeText(settingsRes));
        alert("Failed to load settings from server. See console.");
      }

      const itemsUrl = `${API_BASE}`.replace(/\/{2,}/g, "/").replace("http:/", "http://");
      const itemsRes = await fetch(itemsUrl);
      if (itemsRes.ok) {
        const listRaw = await itemsRes.json();
        // map each server item to local shape
        const list: TestimonialItem[] = (Array.isArray(listRaw) ? listRaw : []).map(mapServerToLocal);
        const sorted = [...list].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
        setItems(sorted);
      } else {
        console.warn("Failed to load items:", itemsRes.status, await safeText(itemsRes));
        alert("Failed to load items from server. See console.");
      }
    } catch (err) {
      console.warn("Load from server failed", err);
      alert("Load failed (network/server). Check console.");
    } finally {
      setLoadingServer(false);
    }
  }

  /* --- LOCAL-only operations (no server calls) --- */

  function resetForm() {
    setForm({ name: "", position: "", company: "", text: "", file: null, imageUrl: "", rating: null });
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function addOrSaveLocal() {
    if (!form.text.trim()) {
      alert("Please enter testimonial text.");
      return;
    }
    let image = (form.imageUrl && form.imageUrl.trim()) || "";
    if (form.file) {
      image = URL.createObjectURL(form.file);
    }

    if (editingId) {
      setItems((s) =>
        s.map((t) =>
          t.id === editingId
            ? {
                ...t,
                name: form.name || "Anonymous",
                position: form.position,
                company: form.company,
                text: form.text,
                image: image || t.image,
                // only update rating if user filled it (not null) and rating enabled for preset
                rating: ratingEnabledForPreset(preset) ? (form.rating != null ? form.rating : t.rating) : t.rating,
              }
            : t
        )
      );
    } else {
      const newItem: TestimonialItem = {
        id: Date.now().toString(),
        name: form.name || "Anonymous",
        position: form.position,
        company: form.company,
        text: form.text,
        image,
        // only set rating when user provided one
        rating: ratingEnabledForPreset(preset) && form.rating != null ? form.rating : undefined,
        orderIndex: items.length ? Math.max(...items.map(i => i.orderIndex ?? 0)) + 1 : 0,
        isActive: true,
      };
      setItems((s) => [newItem, ...s]);
    }
    resetForm();
  }

  function startEdit(item: TestimonialItem) {
    setForm({
      name: item.name,
      position: item.position || "",
      company: item.company || "",
      text: item.text,
      file: null,
      imageUrl: item.image || "",
      rating: item.rating ?? null, // keep null if backend didn't have rating
    });
    setEditingId(item.id);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeItemLocal(id: string) {
    if (!window.confirm("Delete this testimonial locally?")) return;
    setItems((s) => s.filter((t) => t.id !== id));
  }

  function moveItemLocal(id: string, dir: -1 | 1) {
    setItems((s) => {
      const idx = s.findIndex((x) => x.id === id);
      if (idx === -1) return s;
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= s.length) return s;
      const copy = [...s];
      const [it] = copy.splice(idx, 1);
      copy.splice(newIdx, 0, it);
      return copy.map((it2, i) => ({ ...it2, orderIndex: i }));
    });
  }

  /* rating helpers */
  function ratingEnabledForPreset(key: string) {
    return !!ratingEnabledMap[key];
  }

  // IMPORTANT: do NOT auto-fill ratings when enabling. leave items' ratings untouched.
  function toggleRatingForPreset(key: string, value: boolean) {
    setRatingEnabledMap((m) => {
      const next = { ...m, [key]: value };
      localStorage.setItem(STORAGE_KEYS.ratingMap, JSON.stringify(next));
      return next;
    });
    // no assignment to items -> ratings remain empty unless user sets them
  }

  function renderStars(rating?: number) {
    if (rating == null) return null; // do not show empty stars when rating is not provided
    const r = Math.max(0, Math.min(5, Math.round(rating ?? 0)));
    const stars = Array.from({ length: 5 }).map((_, i) => (i < r ? "★" : "☆")).join(" ");
    return (
      <Typography variant="caption" sx={{ display: "block", color: "#ffb400", mt: 1 }}>
        {stars}
      </Typography>
    );
  }

  /* --- Server sync helpers --- */

  async function saveSettingsToServer(payload: {
    templateKey: string;
    sliderEnabled: boolean;
    swiperEnabled: boolean;
    loopEnabled: boolean;
    intervalSeconds: number;
    ratingEnabledMap?: string;
  }) {
    try {
      const dto = {
        tenantId: "default",
        templateKey: payload.templateKey,
        sliderEnabled: payload.sliderEnabled,
        swiperEnabled: payload.swiperEnabled,
        loopEnabled: payload.loopEnabled,
        intervalSeconds: payload.intervalSeconds,
        ratingEnabledMap: payload.ratingEnabledMap ?? JSON.stringify(ratingEnabledMap),
        updatedBy: "frontend",
      };
      const url = `${API_BASE}/settings`;
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      });
      if (!res.ok) {
        console.error("Settings save failed:", res.status, await safeText(res));
        return false;
      }
      return true;
    } catch (err) {
      console.error("saveSettings error", err);
      return false;
    }
  }

  async function saveItemToServer(item: TestimonialItem): Promise<any | null> {
    try {
      const payload = mapLocalToServerPayload(item);
      const postUrl = `${API_BASE}`;
      const postRes = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (postRes.ok) {
        return await postRes.json();
      } else {
        const putUrl = `${API_BASE}/${encodeURIComponent(item.id)}`;
        const putRes = await fetch(putUrl, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (putRes.ok) {
          return await putRes.json();
        } else {
          console.error("Item save failed (POST+PUT):", postRes.status, await safeText(postRes), putRes.status, await safeText(putRes));
          return null;
        }
      }
    } catch (err) {
      console.error("saveItemToServer error", err);
      return null;
    }
  }

  // Save everything (settings + items) — run only when user clicks
  async function saveAll() {
    setSaving(true);
    try {
      const settingsOk = await saveSettingsToServer({
        templateKey: preset,
        sliderEnabled,
        swiperEnabled,
        loopEnabled,
        intervalSeconds: intervalSec,
        ratingEnabledMap: JSON.stringify(ratingEnabledMap),
      });

      const normalized = items.map((it, idx) => ({ ...it, orderIndex: it.orderIndex ?? idx }));
      setItems(normalized);

      const savedServerObjects: any[] = [];
      for (const it of normalized) {
        const saved = await saveItemToServer(it);
        savedServerObjects.push(saved);
      }

      // map server returned objects back to local shape (so imageUrl -> image)
      const resultsLocal = savedServerObjects
        .filter(Boolean)
        .map((so) => mapServerToLocal(so));

      const failed = savedServerObjects.filter((r) => r === null).length;
      if (!settingsOk || failed > 0) {
        alert(`Save completed with ${failed} item(s) failed and settings ${settingsOk ? "OK" : "FAILED"}. Check console/server logs.`);
        console.warn("saveAll results", { settingsOk, savedServerObjects });
      } else {
        alert("All saved successfully to server.");
        setItems(resultsLocal);
      }
    } finally {
      setSaving(false);
    }
  }

  // >>> key to force re-init of Swiper when toggles change
  const swiperKey = `${preset}-${sliderEnabled ? "S" : "NS"}-${swiperEnabled ? "W" : "NW"}-${intervalSec}-${loopEnabled ? "L" : "NL"}-${items.length}-${JSON.stringify(ratingEnabledMap)}`;

  /* ---------- Renderers for styles A..F (full implementations) ---------- */

  function RenderStyleA({ item }: { item: TestimonialItem }) {
    return (
      <Box sx={{ maxWidth: 680, mx: "auto", textAlign: "center" }}>
        <Box sx={{ position: "relative", mb: -6 }}>
          <Avatar src={item.image} sx={{ width: 120, height: 120, mx: "auto", border: "6px solid white" }} />
        </Box>
        <Card sx={{ borderRadius: 3, pt: 8, pb: 4, px: 4, backgroundColor: "#2f5f3a", color: "#fff" }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{item.name}</Typography>
          <Typography variant="caption" sx={{ display: "block", mb: 2 }}>{item.position} {item.company ? `— ${item.company}` : ""}</Typography>
          <Typography variant="body1" sx={{ mx: "auto", maxWidth: 520, fontStyle: "italic", lineHeight: 1.6 }}>{item.text}</Typography>
          {ratingEnabledForPreset(preset) && renderStars(item.rating)}
        </Card>
      </Box>
    );
  }

  function RenderStyleB({ item }: { item: TestimonialItem }) {
    return (
      <Card sx={{ minWidth: 280, maxWidth: 360, borderRadius: 2, boxShadow: 6 }}>
        <CardContent sx={{ background: "linear-gradient(135deg,#5b21b6,#8b5cf6)", color: "#fff", borderRadius: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
            <Avatar src={item.image} sx={{ width: 64, height: 64, border: "3px solid rgba(255,255,255,0.6)" }} />
          </Box>
          <Typography variant="h6" sx={{ textAlign: "center", fontWeight: 700 }}>{item.name}</Typography>
          <Typography variant="caption" sx={{ textAlign: "center", display: "block", mb: 1 }}>{item.position}</Typography>
          <Typography variant="body2" sx={{ textAlign: "center", fontStyle: "italic" }}>{item.text}</Typography>
          {ratingEnabledForPreset(preset) && renderStars(item.rating)}
        </CardContent>
      </Card>
    );
  }

  function RenderStyleC({ item }: { item: TestimonialItem }) {
    return (
      <Box sx={{ width: 340 }}>
        <Card sx={{ display: "flex", alignItems: "center", gap: 2, p: 2, borderRadius: 3, boxShadow: 3 }}>
          <Box sx={{ position: "relative", ml: -3 }}>
            <Avatar src={item.image} sx={{ width: 84, height: 84, border: "4px solid white", boxShadow: 2 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{item.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>{item.position} {item.company ? `— ${item.company}` : ""}</Typography>
            <Typography variant="body2" sx={{ color: "#444" }}>{item.text}</Typography>
            {ratingEnabledForPreset(preset) && renderStars(item.rating)}
          </Box>
        </Card>
      </Box>
    );
  }

  function RenderStyleD({ item }: { item: TestimonialItem }) {
    return (
      <Card sx={{ width: 320, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h3" sx={{ lineHeight: 0.6, color: "#222", mb: 1 }}>“</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>{item.text}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
            <Avatar src={item.image} sx={{ width: 48, height: 48 }} />
            <Box>
              <Typography variant="subtitle2">{item.name}</Typography>
              <Typography variant="caption" color="text.secondary">{item.position}</Typography>
            </Box>
          </Box>
          {ratingEnabledForPreset(preset) && renderStars(item.rating)}
        </CardContent>
      </Card>
    );
  }

  function RenderStyleE({ item }: { item: TestimonialItem }) {
    const stars = item.rating == null ? null : Array.from({ length: 5 }).map((_, i) => (i < (item.rating ?? 0) ? "★" : "☆")).join(" ");
    return (
      <Card sx={{ minWidth: 260, borderRadius: 3 }}>
        <CardContent sx={{ background: "linear-gradient(180deg,#0f172a,#1e293b)", color: "#fff", borderRadius: 3 }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Avatar src={item.image} sx={{ width: 56, height: 56, border: "2px solid rgba(255,255,255,0.15)" }} />
            <Box>
              <Typography variant="subtitle1">{item.name}</Typography>
              <Typography variant="caption">{item.position}</Typography>
            </Box>
          </Box>
          <Typography variant="body2" sx={{ mt: 2, fontStyle: "italic" }}>{item.text}</Typography>
          {ratingEnabledForPreset(preset) && stars && (
            <Typography variant="caption" sx={{ display: "block", mt: 2, opacity: 0.9 }}>{stars}</Typography>
          )}
        </CardContent>
      </Card>
    );
  }

  function RenderStyleF({ item }: { item: TestimonialItem }) {
    return (
      <Card sx={{ minWidth: 300, borderRadius: 2, border: "6px solid #07a" }}>
        <CardContent sx={{ background: "#e6f7ff" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, textAlign: "center" }}>{item.name}</Typography>
          <Typography variant="caption" sx={{ display: "block", textAlign: "center", mb: 1 }}>{item.position}</Typography>
          <Typography variant="body2" sx={{ textAlign: "center", color: "#0a3740" }}>{item.text}</Typography>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Avatar src={item.image} sx={{ width: 56, height: 56 }} />
          </Box>
          {ratingEnabledForPreset(preset) && renderStars(item.rating)}
        </CardContent>
      </Card>
    );
  }

  function renderByPreset(it: TestimonialItem) {
    switch (preset) {
      case "styleA":
        return <RenderStyleA item={it} />;
      case "styleB":
        return <RenderStyleB item={it} />;
      case "styleC":
        return <RenderStyleC item={it} />;
      case "styleD":
        return <RenderStyleD item={it} />;
      case "styleE":
        return <RenderStyleE item={it} />;
      case "styleF":
        return <RenderStyleF item={it} />;
      default:
        return <RenderStyleA item={it} />;
    }
  }

  function SliderOrStaticPreview() {
    const autoplayConfig = swiperEnabled ? { delay: Math.max(1000, intervalSec * 1000), disableOnInteraction: false } : undefined;
    const allowTouch = sliderEnabled;

    if (sliderEnabled || swiperEnabled) {
      let slidesPerView: number | "auto" = 1;
      if (preset === "styleB") slidesPerView = Math.min(3, Math.max(1, items.length || 1));
      else if (preset === "styleC" || preset === "styleF") slidesPerView = Math.min(3, Math.max(1, items.length || 1));
      else slidesPerView = 1;

      return (
        <Box sx={{ py: 2 }}>
          <style>{`
            .swiper-button-next, .swiper-button-prev {
              width: 36px;
              height: 36px;
              background: rgba(0,0,0,0.55);
              border-radius: 6px;
              color: #fff;
              --swiper-navigation-size: 16px;
              top: 50% !important;
              transform: translateY(-50%) !important;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .swiper-button-next::after, .swiper-button-prev::after { font-size: 14px; }
          `}</style>

          <Swiper
            key={swiperKey}
            modules={[Autoplay, Pagination, Navigation]}
            slidesPerView={slidesPerView}
            spaceBetween={16}
            loop={loopEnabled && items.length > 1}
            pagination={{ clickable: true }}
            navigation={true}
            autoplay={autoplayConfig as any}
            allowTouchMove={allowTouch}
            style={{ paddingBottom: 24 }}
          >
            {items.length === 0 ? (
              <SwiperSlide key="empty-1">
                {renderByPreset({ id: "empty", name: "Customer name", position: "Position", text: "Empty testimonial text — add some testimonials.", image: "" })}
              </SwiperSlide>
            ) : (
              items.map((it) => (
                <SwiperSlide key={it.id}>
                  <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>{renderByPreset(it)}</Box>
                  <Box sx={{ display: "flex", gap: 1, mt: 1, justifyContent: "center" }}>
                    <IconButton size="small" onClick={() => moveItemLocal(it.id, -1)}><ArrowUpward fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => moveItemLocal(it.id, 1)}><ArrowDownward fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => startEdit(it)}><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => removeItemLocal(it.id)}><Delete fontSize="small" /></IconButton>
                  </Box>
                </SwiperSlide>
              ))
            )}
          </Swiper>
        </Box>
      );
    }

    return (
      <Grid container spacing={2} sx={{ py: 2 }}>
        {items.length === 0 ? (
          <Grid>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <Typography variant="body1">No testimonials yet — add one using the form.</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          items.map((it) => (
            <Grid key={it.id}>
              <Box>
                {renderByPreset(it)}
                <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                  <IconButton size="small" onClick={() => moveItemLocal(it.id, -1)}><ArrowUpward fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => moveItemLocal(it.id, 1)}><ArrowDownward fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => startEdit(it)}><Edit fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => removeItemLocal(it.id)}><Delete fontSize="small" /></IconButton>
                </Box>
              </Box>
            </Grid>
          ))
        )}
      </Grid>
    );
  }

  // main UI
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Testimonials Builder — Slider & Swiper (with style-specific ratings)</Typography>
      <Grid container spacing={2}>
        <Grid>
          <Card sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Typography variant="subtitle1">Style Select</Typography>
              <Select value={preset} onChange={(e: SelectChangeEvent) => setPreset(e.target.value)} fullWidth>
                {STYLE_OPTIONS.map((s) => (<MenuItem value={s.key} key={s.key}>{s.label}</MenuItem>))}
              </Select>
              <Divider />
              <FormControlLabel control={<Switch checked={sliderEnabled} onChange={(_, v) => setSliderEnabled(v)} />} label="Enable Slider (touch slide)" />
              <FormControlLabel control={<Switch checked={swiperEnabled} onChange={(_, v) => setSwiperEnabled(v)} />} label="Enable Swiper (autoplay)" />
              <FormControlLabel control={<Switch checked={loopEnabled} onChange={(_, v) => setLoopEnabled(v)} />} label="Loop slides" />
              <TextField label="Interval (seconds)" value={String(intervalSec)} onChange={(e) => { const raw = Number(e.target.value || 0); let v = Number.isFinite(raw) ? Math.round(raw) : intervalSec; if (v < 1) v = 1; if (v > 10) v = 10; setIntervalSec(v); }} size="small" fullWidth disabled={!swiperEnabled} />
              <Divider />
              {/* --- Ratings toggle for current style --- */}
              <Typography variant="subtitle2">Ratings</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={ratingEnabledForPreset(preset)}
                    onChange={(_, v) => toggleRatingForPreset(preset, v)}
                  />
                }
                label={`Enable ratings for ${preset}`}
              />
              <Divider />

              <Typography variant="subtitle2">Add / Edit Testimonial</Typography>
              <TextField label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} fullWidth size="small" />
              <TextField label="Position" value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))} fullWidth size="small" />
              <TextField label="Company / Logo URL" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} fullWidth size="small" />
              <TextField label="Image URL" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} fullWidth size="small" />
              <TextField label="Testimonial text" value={form.text} onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))} multiline rows={3} fullWidth size="small" />

              {/* show rating input only when ratings enabled for current style.
                  Input is empty unless user types a number. */}
              {ratingEnabledForPreset(preset) && (
                <TextField
                  label="Rating (1-5)"
                  value={form.rating == null ? "" : String(form.rating)}
                  onChange={(e) => {
                    const raw = e.target.value.trim();
                    if (raw === "") {
                      setForm((f) => ({ ...f, rating: null }));
                      return;
                    }
                    const num = Number(raw);
                    if (Number.isNaN(num)) return;
                    const v = Math.max(1, Math.min(5, Math.round(num)));
                    setForm((f) => ({ ...f, rating: v }));
                  }}
                  fullWidth
                  size="small"
                  type="number"
                  inputProps={{ min: 1, max: 5 }}
                />
              )}

              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files && e.target.files[0]; setForm((s) => ({ ...s, file: f || null })); }} />
              <Stack direction="row" spacing={1} alignItems="center">
                <Button variant="outlined" startIcon={<FileUpload />} onClick={() => fileInputRef.current?.click()}>Upload image</Button>
                <Button variant="contained" startIcon={<Save />} onClick={addOrSaveLocal}>{editingId ? "Save (Local)" : "Add (Local)"}</Button>
                <Button color="error" variant="outlined" onClick={() => { setItems([]); localStorage.removeItem(STORAGE_KEYS.items); }}>Clear ALL (Local)</Button>
                <Box sx={{ flex: 1 }} />
                <Tooltip title="Load settings & items from server">
                  <span>
                    <Button variant="outlined" onClick={loadFromServer} disabled={loadingServer}>
                      {loadingServer ? <><CircularProgress size={16} sx={{ mr: 1 }} />Loading...</> : "LOAD FROM SERVER"}
                    </Button>
                  </span>
                </Tooltip>
                <Tooltip title="Save all local changes (settings + items) to server">
                  <span>
                    <Button variant="contained" color="primary" onClick={saveAll} disabled={saving}>
                      {saving ? <><CircularProgress size={18} sx={{ mr: 1 }} />Saving...</> : "SAVE ALL TO SERVER"}
                    </Button>
                  </span>
                </Tooltip>
              </Stack>

              <Divider />
              <Typography variant="caption" color="text.secondary">Tip: Use the local Add/Save buttons to edit locally. Press "LOAD FROM SERVER" to fetch DB content. Press "SAVE ALL TO SERVER" to persist everything to the database.</Typography>

              <Stack direction="row" spacing={1}>
                <Button onClick={() => { const sample: TestimonialItem = { id: Date.now().toString(), name: "Hayden Bennett", position: "Designer", company: "Mockplus", text: "We loved working with the team — fantastic results!", image: "https://via.placeholder.com/120", rating: undefined, orderIndex: items.length ? Math.max(...items.map(i => i.orderIndex ?? 0)) + 1 : 0, isActive: true }; setItems((s) => [sample, ...s]); }}>Add sample (Local)</Button>
                <Tooltip title="Export HTML to clipboard & open new tab"><Button onClick={() => { alert("Export not implemented in this snippet. Use previous file or implement if needed."); }}>Export HTML</Button></Tooltip>
              </Stack>
            </Stack>
          </Card>
        </Grid>

        <Grid>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle1">Live Preview — {STYLE_OPTIONS.find((s) => s.key === preset)?.label}</Typography>
            <Divider sx={{ my: 1 }} />
            <Box>{SliderOrStaticPreview()}</Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
