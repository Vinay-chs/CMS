import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Grid,
  InputAdornment,
  IconButton,
  TextField,
  Chip,
  Stack,
  useTheme,
  Avatar,
  Alert,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import ViewCarouselIcon from "@mui/icons-material/ViewCarousel";
import PeopleIcon from "@mui/icons-material/People";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import DescriptionIcon from "@mui/icons-material/Description";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import BarChartIcon from "@mui/icons-material/BarChart";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import EditIcon from "@mui/icons-material/Edit";

import { PageProps } from "../types/routes";

type CardDef = {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  live?: boolean;
  moduleKey?: string;
  tags?: string[];
};

const ALL_CARDS: CardDef[] = [
  { id: "nav", title: "Nav Builder", subtitle: "Customize your navbar with slugs", icon: MenuBookIcon, live: true, moduleKey: "navbar", tags: ["design", "nav", "slug"] },
  { id: "carousel", title: "Carousels", subtitle: "Manage sliders & banners with slugs", icon: ViewCarouselIcon, live: true, moduleKey: "carousel", tags: ["media", "slug"] },
  { id: "testimonials", title: "Testimonials", subtitle: "Manage customer reviews", icon: PeopleIcon, live: true, moduleKey: "testimonials", tags: ["content"] },
  { id: "newsletter", title: "Newsletter", subtitle: "Design signup flows", icon: MailOutlineIcon, live: true, moduleKey: "newsletter", tags: ["marketing"] },
  { id: "team", title: "Team", subtitle: "Add & edit team members", icon: PeopleIcon, live: true, moduleKey: "team", tags: ["content"] },
  { id: "footer", title: "Footer", subtitle: "Customize footer with slugs", icon: ArrowDropDownIcon, live: true, moduleKey: "footer", tags: ["layout", "slug"] },
  { id: "faqs", title: "FAQs", subtitle: "Common questions", icon: HelpOutlineIcon, live: false },
  { id: "whyus", title: "Why Choose Us", subtitle: "Key highlights", icon: StarBorderIcon, live: false },
  { id: "enquiry", title: "Enquiry Form", subtitle: "Customer enquiries", icon: ContactMailIcon, live: false },
  { id: "searchfilters", title: "Search Filters", subtitle: "Configure search filters", icon: TuneIcon, live: false },
  { id: "pricerange", title: "Price Range", subtitle: "Configure price ranges", icon: BarChartIcon, live: false },
];

type Props = PageProps & {
  setSelectedModule?: (m: string) => void;
  setAllowSkip?: (v: boolean) => void;
};

export default function HomeModule({ setSelectedModule, setAllowSkip }: Props) {
  const theme = useTheme();
  const [q, setQ] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [baseSlug, setBaseSlug] = useState("");
  const [editSlug, setEditSlug] = useState(false);
  const [newSlug, setNewSlug] = useState("");

  // Read from URL query params first, fallback to localStorage
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlSlug = params.get("baseSlug");
      const urlSite = params.get("siteUrl");

      if (urlSlug) {
        const normalized = urlSlug.trim().toLowerCase();
        localStorage.setItem('cms_base_slug', normalized);
        setBaseSlug(normalized);
        setNewSlug(normalized);
      } else {
        const savedSlug = localStorage.getItem('cms_base_slug');
        if (savedSlug) {
          setBaseSlug(savedSlug);
          setNewSlug(savedSlug);
        }
      }

      if (urlSite) {
        localStorage.setItem('cms_site_url', urlSite);
      }
    } catch (err) {
      // fail gracefully
      const savedSlug = localStorage.getItem('cms_base_slug');
      if (savedSlug) {
        setBaseSlug(savedSlug);
        setNewSlug(savedSlug);
      }
    }
  }, []);

  // Update base slug
  const updateBaseSlug = () => {
    if (newSlug.trim() && /^[a-zA-Z0-9-]+$/.test(newSlug)) {
      localStorage.setItem('cms_base_slug', newSlug.trim().toLowerCase());
      setBaseSlug(newSlug.trim().toLowerCase());
      setEditSlug(false);
    }
  };

  // Go back to slug landing (clears stored slug and honors setAllowSkip)
  function goBackToLanding() {
    // clear saved slug
    localStorage.removeItem('cms_base_slug');
    // if parent passed setAllowSkip, ensure landing is shown next
    if (setAllowSkip) setAllowSkip(false);
    // navigate back: if parent provided setSelectedModule, clear selection to force landing
    if (setSelectedModule) setSelectedModule("");
    // otherwise, fallback: reload page to pick up landing state
    if (!setSelectedModule) window.location.reload();
  }

  // Build tag list from cards
  const tags = useMemo(() => {
    const s = new Set<string>();
    ALL_CARDS.forEach((c) => c.tags?.forEach((t) => s.add(t)));
    return Array.from(s);
  }, []);

  // Filtered cards
  const filtered = useMemo(() => {
    const lower = q.trim().toLowerCase();
    return ALL_CARDS.filter((c) => {
      if (activeTag && !(c.tags || []).includes(activeTag)) return false;
      if (!lower) return true;
      return (c.title + " " + (c.subtitle || "")).toLowerCase().includes(lower);
    });
  }, [q, activeTag]);

  function openCard(c: CardDef) {
    if (c.live && c.moduleKey && setSelectedModule) {
      setSelectedModule(c.moduleKey);
      return;
    }
    window.alert(`${c.title} is coming soon — we'll ship it shortly.`);
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Hero */}
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          mb: 4,
          display: "flex",
          gap: 3,
          alignItems: "center",
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          boxShadow: 2,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}08, ${theme.palette.background.paper})`,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 64, height: 64 }}>
          <HomeIcon sx={{ color: theme.palette.common.white }} />
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.6px" }}>
            CMS Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Modern, fast admin tools — everything you need to manage the site in one place.
          </Typography>

          {/* Base Slug Display & Edit */}
          <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InfoIcon fontSize="small" />
                  Current Website Slug: 
                  {!editSlug ? (
                    <Chip 
                      label={baseSlug || "—"} 
                      color="primary" 
                      size="small"
                      onDelete={() => setEditSlug(true)}
                      deleteIcon={<EditIcon />}
                      sx={{ ml: 1 }}
                    />
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <TextField
                        size="small"
                        value={newSlug}
                        onChange={(e) => setNewSlug(e.target.value)}
                        placeholder="Enter new slug"
                        sx={{ width: 200 }}
                      />
                      <Button size="small" variant="contained" onClick={updateBaseSlug}>
                        Update
                      </Button>
                      <Button size="small" onClick={() => {
                        setEditSlug(false);
                        setNewSlug(baseSlug);
                      }}>
                        Cancel
                      </Button>
                    </Box>
                  )}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  All components will be saved under: <strong>/{baseSlug || "component-name"}/</strong>
                </Typography>
              </Box>
            </Box>
          </Alert>
        </Box>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <TextField
            size="small"
            placeholder="Search modules, e.g. 'Nav Builder'"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: 160, sm: 260, md: 360 } }}
          />
          <Button variant="outlined" startIcon={<TuneIcon />} onClick={() => { setActiveTag(null); setQ(""); }}>
            Reset
          </Button>
          {/* Back button: returns to slug landing */}
          <Button variant="text" onClick={goBackToLanding}>Back</Button>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: "auto", mb: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Quick filters
          </Typography>
          {tags.map((t) => (
            <Chip
              key={t}
              label={t}
              size="small"
              clickable
              color={activeTag === t ? "primary" : "default"}
              onClick={() => setActiveTag((s) => (s === t ? null : t))}
            />
          ))}
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {/* Grid */}
        <Grid container spacing={3}>
          {filtered.map((c) => {
            const Icon = c.icon || DescriptionIcon;
            return (
              <Grid  key={c.id}>
                <Card
                  onClick={() => openCard(c)}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    cursor: c.live ? "pointer" : "default",
                    transition: "transform .18s ease, boxShadow .18s ease",
                    '&:hover': c.live ? { transform: "translateY(-6px)", boxShadow: 6 } : {},
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: 2,
                          display: "grid",
                          placeItems: "center",
                          bgcolor: c.live ? "primary.50" : "action.disabledBackground",
                          boxShadow: 1,
                        }}
                      >
                        <Icon sx={{ fontSize: 28, color: c.live ? "primary.main" : "text.disabled" }} />
                      </Box>

                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {c.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {c.subtitle}
                        </Typography>

                        {c.tags && (
                          <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                            {c.tags.map((t) => (
                              <Chip 
                                key={t} 
                                label={t} 
                                size="small" 
                                variant="outlined" 
                                color={t === "slug" ? "secondary" : "default"}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </CardContent>

                  <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Button
                      size="small"
                      variant={c.live ? "contained" : "outlined"}
                      color={c.live ? "primary" : "inherit"}
                      onClick={(e) => { e.stopPropagation(); openCard(c); }}
                      sx={{ textTransform: "none", fontWeight: 700 }}
                    >
                      {c.live ? "Open" : "Coming soon"}
                    </Button>

                    {!c.live && (
                      <Typography variant="caption" color="text.secondary">Planned</Typography>
                    )}
                  </Box>
                </Card>
              </Grid>
            );
          })}

          {filtered.length === 0 && (
            <Grid>
              <Card sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="h6">No modules match your search.</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Try clearing filters or selecting a different tag.
                </Typography>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
}
