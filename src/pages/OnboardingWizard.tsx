import React, { useState, useEffect, ChangeEvent } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardActionArea,
  CardContent,
  FormControlLabel,
  Switch,
  Stack,
  Fade,
  useTheme,
  LinearProgress,
  Tooltip
} from "@mui/material";
import {
  AutoAwesome,
  Link as LinkIcon,
  CheckCircle,
  ErrorOutline,
  CloudUpload,
  ColorLens,
  ChevronRight,
  ArrowBack,
  Save
} from "@mui/icons-material";

type OnboardingData = {
  siteName: string;
  siteUrl: string;
  baseSlug: string;
  industry: string;
  cmsType: string;
  logoDataUrl?: string | null;
  primaryColor: string;
  darkMode: boolean;
  template: string;
  createdAt?: string;
};

const defaultData: OnboardingData = {
  siteName: "",
  siteUrl: "",
  baseSlug: "",
  industry: "",
  cmsType: "",
  logoDataUrl: null,
  primaryColor: "#6C5CE7",
  darkMode: false,
  template: ""
};

const STORAGE_KEY = "cms_onboarding_v1";

const industries = [
  "E-commerce",
  "Personal Portfolio",
  "Blog / News",
  "Agency / Services",
  "Documentation",
  "Education",
  "SaaS",
  "Other"
];

const cmsTypes = ["Blog", "E-commerce", "Portfolio", "Docs", "Custom"];

const templates = [
  { id: "modern", title: "Modern", desc: "Clean sections, hero-first layout" },
  { id: "store", title: "Store", desc: "Catalog + product-focused layout" },
  { id: "agency", title: "Agency", desc: "Portfolio + services showcase" },
  { id: "docs", title: "Docs", desc: "Sidebar + content heavy" }
];

function generateSlug(from: string) {
  const s = from
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return s;
}

function isValidSlug(s: string) {
  if (!s) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
}

function isValidUrl(url: string) {
  // Basic check: allow hostnames, http(s), or IPs
  try {
    // allow missing protocol by adding https:// if not present
    const maybe = url.startsWith("http") ? url : `https://${url}`;
    const u = new URL(maybe);
    return !!u.hostname;
  } catch (e) {
    return false;
  }
}

export default function OnboardingWizard({
  setSelectedModule,
  setAllowSkip
}: {
  setSelectedModule?: (moduleName: string) => void;
  setAllowSkip?: (v: boolean) => void;
}) {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState<number>(0);
  const steps = ["Site Info", "Branding", "Template", "Review & Save"];

  const [data, setData] = useState<OnboardingData>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : defaultData;
    } catch {
      return defaultData;
    }
  });

  const [slugValid, setSlugValid] = useState<boolean>(isValidSlug(data.baseSlug));
  const [urlValid, setUrlValid] = useState<boolean>(isValidUrl(data.siteUrl));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSlugValid(isValidSlug(data.baseSlug));
  }, [data.baseSlug]);

  useEffect(() => {
    setUrlValid(isValidUrl(data.siteUrl));
  }, [data.siteUrl]);

  function update<K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function handleLogoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      update("logoDataUrl", reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleGenerateSlugFromName() {
    const s = generateSlug(data.siteName || data.siteUrl || "my-site");
    update("baseSlug", s);
  }

  function nextStep() {
    if (activeStep === 0) {
      // validation for step 0
      if (!data.siteName.trim() || !data.baseSlug.trim() || !slugValid || !urlValid) {
        // do not advance — you can surface more granular messages here
        return;
      }
    }
    if (activeStep === 1) {
      // branding: ensure color & cms type selected
      if (!data.primaryColor || !data.cmsType) return;
    }
    if (activeStep < steps.length - 1) setActiveStep((s) => s + 1);
  }

  function prevStep() {
    if (activeStep > 0) setActiveStep((s) => s - 1);
  }

  function saveToLocalStorage(payload: OnboardingData) {
    const copy = { ...payload, createdAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(copy));
  }

  async function handleFinish() {
    console.log("Finishing onboarding with data:", data);
    setSaving(true);
    try {
      // === Save to localStorage ===
      saveToLocalStorage(data);

      // Persist base slug & site URL to keys HomeModule expects
      if (data.baseSlug) {
        localStorage.setItem("cms_base_slug", data.baseSlug);
      }
      if (data.siteUrl) {
        localStorage.setItem("cms_site_url", data.siteUrl);
      }

      // Add query params so HomeModule (or any other component) can read immediately
      const params = new URLSearchParams();
      if (data.siteUrl) params.set("siteUrl", data.siteUrl);
      if (data.baseSlug) params.set("baseSlug", data.baseSlug);
      if (data.template) params.set("template", data.template);
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, "", newUrl);

      // After save, proceed to dashboard — tell App to show home and allow skip
      setAllowSkip?.(true);
      setSelectedModule?.("home");
      setActiveStep(steps.length - 1);
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setSaving(false);
    }
  }

  // small visual helpers
  const glassPaperSx = {
    p: { xs: 3, md: 5 },
    borderRadius: 3,
    background: theme.palette.mode === "dark"
      ? "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))"
      : "rgba(255,255,255,0.72)",
    boxShadow: "0 10px 30px rgba(12, 15, 40, 0.12)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.12)"
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 6,
        px: 2,
        background: `radial-gradient(1200px 600px at 10% 10%, rgba(108,92,231,0.12), transparent), radial-gradient(900px 500px at 90% 90%, rgba(118,75,162,0.10), transparent)`,
        display: "flex",
        alignItems: "center"
      }}
    >
      <Container maxWidth="lg">
        <Fade in>
          <Paper sx={glassPaperSx}>
            <Grid container spacing={4} alignItems="flex-start">
              {/* LEFT: Content */}
              <Grid>
                <Box sx={{ mb: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      <AutoAwesome />
                    </Avatar>
                    <Box>
                      <Typography variant="overline" fontWeight={700}>
                        CMS ONBOARDING
                      </Typography>
                      <Typography variant="h5" fontWeight={800}>
                        Customize your website — quick setup
                      </Typography>
                    </Box>
                  </Stack>

                  <Typography color="text.secondary" sx={{ maxWidth: 680 }}>
                    Provide a few details and we’ll scaffold a tailored CMS workspace for you.
                    You can change everything later in settings.
                  </Typography>
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((label) => (
                      <Step key={label}>
                        <StepLabel>
                          <Typography variant="body2" fontWeight={700}>{label}</Typography>
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </Box>

                <Box sx={{ mt: 4 }}>
                  {/* STEP CONTENT */}
                  {activeStep === 0 && (
                    <Box component="form" noValidate autoComplete="off" sx={{ gap: 2 }}>
                      <Grid container spacing={2}>
                        <Grid >
                          <TextField
                            label="Website Name"
                            fullWidth
                            value={data.siteName}
                            onChange={(e) => update("siteName", e.target.value)}
                            placeholder="e.g., Acme Store"
                            helperText="Friendly name for your dashboard"
                          />
                        </Grid>

                        <Grid >
                          <TextField
                            label="Website URL or IP"
                            fullWidth
                            value={data.siteUrl}
                            onChange={(e) => update("siteUrl", e.target.value)}
                            placeholder="example.com or 192.168.0.12"
                            error={data.siteUrl.length > 0 && !urlValid}
                            helperText={data.siteUrl && !urlValid ? "Enter a valid URL or IP" : "Where will this site be hosted (optional protocol)"}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LinkIcon />
                                </InputAdornment>
                              )
                            }}
                          />
                        </Grid>

                        <Grid >
                          <TextField
                            label="Base Slug"
                            fullWidth
                            value={data.baseSlug}
                            onChange={(e) => update("baseSlug", e.target.value.toLowerCase())}
                            placeholder="my-site-slug"
                            error={data.baseSlug.length > 0 && !slugValid}
                            helperText={data.baseSlug && !slugValid ? "lowercase, letters/numbers, hyphens only" : "Used for content URLs"}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton size="small" onClick={handleGenerateSlugFromName} aria-label="generate slug">
                                    <AutoAwesome />
                                  </IconButton>
                                </InputAdornment>
                              )
                            }}
                          />
                        </Grid>

                        <Grid>
                          <FormControl fullWidth>
                            <InputLabel id="industry-select-label">Industry</InputLabel>
                            <Select
                              labelId="industry-select-label"
                              label="Industry"
                              value={data.industry}
                              onChange={(e) => update("industry", e.target.value as string)}
                            >
                              {industries.map((i) => (
                                <MenuItem value={i} key={i}>{i}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid>
                          <FormControl fullWidth>
                            <InputLabel id="cms-type-label">CMS Type</InputLabel>
                            <Select
                              labelId="cms-type-label"
                              label="CMS Type"
                              value={data.cmsType}
                              onChange={(e) => update("cmsType", e.target.value as string)}
                            >
                              {cmsTypes.map((t) => (
                                <MenuItem value={t} key={t}>{t}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {activeStep === 1 && (
                    <Box>
                      <Grid container spacing={2}>
                        <Grid >
                          <Card variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                            <input
                              accept="image/*"
                              id="logo-upload"
                              type="file"
                              style={{ display: "none" }}
                              onChange={handleLogoUpload}
                            />
                            <label htmlFor="logo-upload">
                              <IconButton component="span" size="large" sx={{ mb: 1 }}>
                                <CloudUpload fontSize="large" />
                              </IconButton>
                            </label>

                            <Box sx={{ mt: 1 }}>
                              {data.logoDataUrl ? (
                                <Avatar src={data.logoDataUrl} variant="rounded" sx={{ width: 120, height: 120, mx: "auto" }} />
                              ) : (
                                <Avatar variant="rounded" sx={{ width: 120, height: 120, mx: "auto", bgcolor: "grey.100" }}>
                                  <CloudUpload />
                                </Avatar>
                              )}
                            </Box>

                            <Typography variant="subtitle1" sx={{ mt: 1 }}>Logo (optional)</Typography>
                            <Typography variant="caption" color="text.secondary">PNG/JPG up to 2MB recommended</Typography>
                          </Card>
                        </Grid>

                        <Grid>
                          <Stack spacing={2}>
                            <Box>
                              <TextField
                                label="Primary Brand Color"
                                type="color"
                                fullWidth
                                value={data.primaryColor}
                                onChange={(e) => update("primaryColor", e.target.value)}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <ColorLens />
                                    </InputAdornment>
                                  )
                                }}
                                sx={{ width: "150px" }}
                              />
                              <Typography variant="caption" sx={{ ml: 1 }}>{data.primaryColor}</Typography>
                            </Box>

                            <FormControlLabel
                              control={<Switch checked={data.darkMode} onChange={(e) => update("darkMode", e.target.checked)} />}
                              label="Prefer dark mode"
                            />

                            <Typography variant="body2" color="text.secondary">
                              Branding settings help us preconfigure theme variables and preview.
                            </Typography>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {activeStep === 2 && (
                    <Box>
                      <Typography variant="subtitle1" sx={{ mb: 2 }}>Pick a starting template</Typography>
                      <Grid container spacing={2}>
                        {templates.map((t) => (
                          <Grid  key={t.id}>
                            <CardActionArea onClick={() => update("template", t.id)}>
                              <Card
                                sx={{
                                  borderRadius: 2,
                                  height: "100%",
                                  border: data.template === t.id ? `2px solid ${theme.palette.primary.main}` : "1px solid rgba(0,0,0,0.06)"
                                }}
                              >
                                <CardContent>
                                  <Typography variant="h6" fontWeight={700}>{t.title}</Typography>
                                  <Typography variant="body2" color="text.secondary">{t.desc}</Typography>
                                </CardContent>
                              </Card>
                            </CardActionArea>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  {activeStep === 3 && (
                    <Box>
                      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Review your settings</Typography>
                      <Grid container spacing={2}>
                        <Grid >
                          <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
                            <Typography variant="subtitle2">Website</Typography>
                            <Typography>{data.siteName || "—"}</Typography>
                            <Typography variant="caption" color="text.secondary">{data.siteUrl || "Not provided"}</Typography>

                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2">Slug</Typography>
                              <Typography>{data.baseSlug || "—"}</Typography>
                            </Box>

                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2">Industry & CMS</Typography>
                              <Typography>{data.industry || "—"} • {data.cmsType || "—"}</Typography>
                            </Box>

                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2">Template</Typography>
                              <Typography>{data.template || "—"}</Typography>
                            </Box>
                          </Paper>
                        </Grid>

                        <Grid >
                          <Paper sx={{ p: 2, borderRadius: 2, textAlign: "center" }}>
                            <Typography variant="subtitle2">Brand</Typography>
                            <Box sx={{ my: 1 }}>
                              {data.logoDataUrl ? (
                                <Avatar src={data.logoDataUrl} variant="rounded" sx={{ width: 80, height: 80, mx: "auto" }} />
                              ) : (
                                <Avatar sx={{ width: 80, height: 80, mx: "auto" }}>{data.siteName?.[0] || "A"}</Avatar>
                              )}
                            </Box>
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption">Primary color</Typography>
                              <Box sx={{ width: 36, height: 24, background: data.primaryColor, borderRadius: 1, mx: "auto", mt: 1 }} />
                            </Box>
                            <Box sx={{ mt: 2 }}>
                              <FormControlLabel control={<Switch checked={data.darkMode} />} label="Dark mode" />
                            </Box>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </Box>

                {/* NAV Buttons */}
                <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
                  <Button variant="outlined" startIcon={<ArrowBack />} onClick={prevStep} disabled={activeStep === 0}>
                    Back
                  </Button>

                  {activeStep < steps.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={nextStep}
                      endIcon={<ChevronRight />}
                      sx={{ ml: "auto" }}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleFinish}
                      endIcon={<Save />}
                      sx={{ ml: "auto" }}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Finish & Save"}
                    </Button>
                  )}
                </Box>

                {activeStep === 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      Tip: Use the Generate button on slug to create SEO-friendly slugs.
                    </Typography>
                  </Box>
                )}
              </Grid>

              {/* RIGHT: fancy preview / examples */}
              <Grid>
                <Box sx={{ position: "sticky", top: 32 }}>
                  {/* Live preview card */}
                  <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      {data.logoDataUrl ? (
                        <Avatar src={data.logoDataUrl} variant="rounded" sx={{ width: 56, height: 56 }} />
                      ) : (
                        <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main" }}>{data.siteName?.[0] || "C"}</Avatar>
                      )}
                      <Box>
                        <Typography fontWeight={700}>{data.siteName || "Your Website"}</Typography>
                        <Typography variant="caption" color="text.secondary">{data.siteUrl || "example.com"}</Typography>
                      </Box>
                    </Stack>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2">Visual Preview</Typography>
                      <Card sx={{
                        mt: 1,
                        borderRadius: 2,
                        overflow: "hidden",
                        border: "1px solid rgba(0,0,0,0.06)"
                      }}>
                        <Box sx={{
                          height: 160,
                          background: `linear-gradient(45deg, ${data.primaryColor}33, ${data.primaryColor}1a)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: data.primaryColor
                        }}>
                          <Typography variant="h6" fontWeight={800}>{data.template ? templates.find(t => t.id === data.template)?.title : "Template preview"}</Typography>
                        </Box>
                      </Card>
                    </Box>
                  </Paper>

                  {/* Quick actions */}
                  <Paper sx={{ p: 2, borderRadius: 3 }}>
                    <Typography variant="subtitle2">Quick Actions</Typography>
                    <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          // quick sample prefill
                          update("siteName", "Demo Store");
                          update("siteUrl", "demo-store.com");
                          update("baseSlug", "demo-store");
                          update("industry", "E-commerce");
                          update("cmsType", "E-commerce");
                          update("template", "store");
                        }}
                      >
                        Prefill Demo
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => {
                          // reset
                          setData(defaultData);
                        }}
                      >
                        Reset
                      </Button>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">Progress</Typography>
                      <LinearProgress variant="determinate" value={((activeStep + 1) / steps.length) * 100} sx={{ mt: 1 }} />
                    </Box>
                  </Paper>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}
