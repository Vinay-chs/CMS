import React, { useState, useEffect, ChangeEvent } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Stack,
  Fade,
  LinearProgress,
  InputAdornment,
  Alert,
} from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SaveIcon from "@mui/icons-material/Save";

type OnboardingData = {
  siteName: string;
  siteUrl: string;
};

const defaultData: OnboardingData = {
  siteName: "",
  siteUrl: "",
};

const STORAGE_KEY = "cms_onboarding_simple";

function isValidUrl(input: string): boolean {
  if (!input.trim()) return false;
  const trimmed = input.trim();

  // Allow IP addresses
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipRegex.test(trimmed)) return true;

  // Allow domains with or without protocol
  try {
    const url = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export default function OnboardingWizard({
  setSelectedModule,
  setAllowSkip,
}: {
  setSelectedModule?: (module: string) => void;
  setAllowSkip?: (allow: boolean) => void;
}) {
  const [activeStep, setActiveStep] = useState(0);
  const steps = ["Site Info", "Review & Save"];

  const [data, setData] = useState<OnboardingData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultData;
    } catch {
      return defaultData;
    }
  });

  const [urlValid, setUrlValid] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setUrlValid(isValidUrl(data.siteUrl));
  }, [data.siteUrl]);

  const update = (key: keyof OnboardingData, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    if (activeStep === 0 && (!data.siteName.trim() || !data.siteUrl.trim() || !urlValid)) {
      return;
    }
    if (activeStep < steps.length - 1) {
      setActiveStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 0) setActiveStep((s) => s - 1);
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

      const identifier = data.siteUrl.trim();
      localStorage.setItem("cms_base_slug", identifier);
      localStorage.setItem("cms_site_url", identifier);

      const params = new URLSearchParams();
      params.set("siteUrl", identifier);
      params.set("baseSlug", identifier);
      window.history.replaceState(null, "", `?${params.toString()}`);

      setAllowSkip?.(true);
      setSelectedModule?.("home");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const isNextDisabled = activeStep === 0 && (!data.siteName.trim() || !data.siteUrl.trim() || !urlValid);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Fade in>
          <Paper
            elevation={12}
            sx={{
              p: 5,
              borderRadius: 4,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Stack spacing={4}>
              <Box textAlign="center">
                <Typography variant="h4" fontWeight={900} color="primary">
                  Welcome to CMS
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  Let's set up your website in seconds
                </Typography>
              </Box>

              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {/* Step 1: Site Info */}
              {activeStep === 0 && (
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Website Name"
                    placeholder="My Awesome Store"
                    value={data.siteName}
                    onChange={(e) => update("siteName", e.target.value)}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Website URL or IP"
                    placeholder="example.com or 192.168.1.100"
                    value={data.siteUrl}
                    onChange={(e) => update("siteUrl", e.target.value)}
                    error={data.siteUrl.length > 0 && !urlValid}
                    helperText={
                      data.siteUrl && !urlValid
                        ? "Enter a valid domain or IP address"
                        : "This will be your site identifier"
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LinkIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>
              )}

              {/* Step 2: Review */}
              {activeStep === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    All Set!
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 3, mt: 2 }}>
                    <Grid container spacing={2}>
                      <Grid>
                        <Typography variant="subtitle2" color="text.secondary">
                          Website Name
                        </Typography>
                        <Typography fontWeight="bold">{data.siteName}</Typography>
                      </Grid>
                      <Grid >
                        <Typography variant="subtitle2" color="text.secondary">
                          Site Identifier (URL/IP)
                        </Typography>
                        <Typography fontWeight="bold">{data.siteUrl}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                  <Alert severity="success" sx={{ mt: 3 }}>
                    Your site will be managed using: <strong>{data.siteUrl}</strong>
                  </Alert>
                </Box>
              )}

              {/* Navigation */}
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={prevStep}
                  disabled={activeStep === 0}
                >
                  Back
                </Button>

                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<SaveIcon />}
                    onClick={handleFinish}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Enter Dashboard"}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ChevronRightIcon />}
                    onClick={nextStep}
                    disabled={isNextDisabled}
                  >
                    Review
                  </Button>
                )}
              </Box>

              <LinearProgress
                variant="determinate"
                value={((activeStep + (activeStep === 1 ? 1 : 0.5)) / steps.length) * 100}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Stack>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}