// src/pages/Newsletter.tsx
import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Stack,
} from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import InfoIcon from "@mui/icons-material/Info";
import ImageIcon from "@mui/icons-material/Image";
import PhotoSizeSelectLargeIcon from "@mui/icons-material/PhotoSizeSelectLarge";
import CloseIcon from "@mui/icons-material/Close";
import { PageProps } from "../types/routes";

/**
 * Newsletter editor + preview with multiple styles.
 *
 * Styles implemented (approximate visual from screenshots):
 * 1 - Right-panel card with illustration + form (rounded white card on colored background)
 * 2 - Full-width hero with left text, right input (soft pastel background)
 * 3 - Centered modal style (dark green background, big CTA)
 * 4 - Rounded dark card (small centered) with blue CTA
 * 5 - Centered dark-blue CTA modal (navy look)
 * 6 - Large image background hero with overlay and inputs inline
 *
 * Left side is editor (text + image/url + toggles), right side is live preview.
 */

const defaultState = {
  headline: "Stay in the healthcare loop",
  subheading:
    "Get product updates, wellness tips and exclusive offers — only one email per week.",
  buttonLabel: "Join the newsletter",
  pillText: "Trusted by 4,200+ subscribers",
  showPrivacy: true,
  previewEmail: "vinay@example.com",
  bgColor: "#f6ad55", // orange-ish default for style 1
  bgImage: "", // user can paste an image URL
  illustrationUrl: "https://i.imgur.com/8Km9tLL.png", // small illustration placeholder
  style: "style1",
};

const styleOptions = [
  { value: "style1", label: "Style 1 — Card with illustration" },
  { value: "style2", label: "Style 2 — Pastel hero with inline input" },
  { value: "style3", label: "Style 3 — Centered modal / CTA" },
  { value: "style4", label: "Style 4 — Dark rounded card" },
  { value: "style5", label: "Style 5 — Navy modal" },
  { value: "style6", label: "Style 6 — Image background hero" },
];

const Newsletter: React.FC<PageProps | {}> = (props) => {
  const [headline, setHeadline] = useState(defaultState.headline);
  const [subheading, setSubheading] = useState(defaultState.subheading);
  const [buttonLabel, setButtonLabel] = useState(defaultState.buttonLabel);
  const [pillText, setPillText] = useState(defaultState.pillText);
  const [showPrivacy, setShowPrivacy] = useState(defaultState.showPrivacy);
  const [previewEmail, setPreviewEmail] = useState(defaultState.previewEmail);
  const [bgColor, setBgColor] = useState(defaultState.bgColor);
  const [bgImage, setBgImage] = useState(defaultState.bgImage);
  const [illustrationUrl, setIllustrationUrl] = useState(defaultState.illustrationUrl);
  const [style, setStyle] = useState<string>(defaultState.style);

  function resetAll() {
    setHeadline(defaultState.headline);
    setSubheading(defaultState.subheading);
    setButtonLabel(defaultState.buttonLabel);
    setPillText(defaultState.pillText);
    setShowPrivacy(defaultState.showPrivacy);
    setPreviewEmail(defaultState.previewEmail);
    setBgColor(defaultState.bgColor);
    setBgImage(defaultState.bgImage);
    setIllustrationUrl(defaultState.illustrationUrl);
    setStyle(defaultState.style);
  }

  // simple validation for email in preview input (not used to submit)
  const isValidEmail = (s: string) => /\S+@\S+\.\S+/.test(s);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}>
        <MailOutlineIcon sx={{ fontSize: 34 }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Newsletter Builder
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pick a style, edit texts, background/image and preview live.
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.1fr 1fr" },
          gap: 3,
        }}
      >
        {/* Editor */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Settings
            </Typography>

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel id="style-label">Choose style</InputLabel>
              <Select
                labelId="style-label"
                label="Choose style"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
              >
                {styleOptions.map((s) => (
                  <MenuItem value={s.value} key={s.value}>
                    {s.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Headline"
              fullWidth
              size="small"
              sx={{ mb: 2 }}
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />

            <TextField
              label="Subheading"
              fullWidth
              multiline
              minRows={2}
              size="small"
              sx={{ mb: 2 }}
              value={subheading}
              onChange={(e) => setSubheading(e.target.value)}
            />

            <TextField
              label="Button label"
              fullWidth
              size="small"
              sx={{ mb: 2 }}
              value={buttonLabel}
              onChange={(e) => setButtonLabel(e.target.value)}
            />

            <TextField
              label="Pill text (small tag above headline)"
              fullWidth
              size="small"
              sx={{ mb: 2 }}
              value={pillText}
              onChange={(e) => setPillText(e.target.value)}
            />

            <TextField
              label="Preview email (demo)"
              fullWidth
              size="small"
              sx={{ mb: 2 }}
              value={previewEmail}
              onChange={(e) => setPreviewEmail(e.target.value)}
            />

            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <TextField
                label="Accent / background color (hex)"
                size="small"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                sx={{ flex: 1 }}
                placeholder="#ffffff"
              />
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  // small helper to clear image
                  setBgImage("");
                }}
                startIcon={<CloseIcon />}
              >
                Clear Image
              </Button>
            </Box>

            <TextField
              label="Background image URL (optional)"
              fullWidth
              size="small"
              sx={{ mb: 2 }}
              value={bgImage}
              onChange={(e) => setBgImage(e.target.value)}
            />

            <TextField
              label="Illustration / side image URL (optional)"
              fullWidth
              size="small"
              sx={{ mb: 2 }}
              value={illustrationUrl}
              onChange={(e) => setIllustrationUrl(e.target.value)}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={showPrivacy}
                  onChange={(_, v) => setShowPrivacy(v)}
                />
              }
              label="Show privacy note"
            />

            <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
              <Button variant="contained" disabled>
                Save (demo)
              </Button>
              <Button variant="outlined" onClick={resetAll}>
                Reset
              </Button>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
              Note: This is a live preview. To persist changes, wire the Save button to your backend.
            </Typography>
          </CardContent>
        </Card>

        {/* Preview */}
        <Box>
          {/* Style 1: right-panel illustration + rounded white card on colored background */}
          {style === "style1" && (
            <Box
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                background: bgImage
                  ? `url(${bgImage}) center/cover no-repeat`
                  : bgColor,
                color: bgImage ? "#fff" : "#111827",
                p: 3,
              }}
            >
              <Card sx={{ borderRadius: 3, maxWidth: 980, mx: "auto", p: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    alignItems: "center",
                    minHeight: 160,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="overline" sx={{ display: "block", mb: 1 }}>
                      {pillText}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                      {headline}
                    </Typography>
                    <Typography sx={{ color: "text.secondary", mb: 2 }}>
                      {subheading}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <TextField
                        size="small"
                        placeholder="Your email"
                        value={previewEmail}
                        onChange={(e) => setPreviewEmail(e.target.value)}
                        sx={{ width: 260 }}
                      />
                      <Button variant="contained" sx={{ bgcolor: "#06b6d4" }}>
                        {buttonLabel}
                      </Button>
                    </Stack>
                    {showPrivacy && (
                      <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
                        By subscribing you agree to receive our emails. Unsubscribe any time.
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ width: 160, display: "grid", placeItems: "center" }}>
                    {illustrationUrl ? (
                      <Box
                        component="img"
                        src={illustrationUrl}
                        alt="illustration"
                        sx={{ maxWidth: "100%", borderRadius: 2 }}
                      />
                    ) : (
                      <ImageIcon sx={{ fontSize: 64, color: "action.disabled" }} />
                    )}
                  </Box>
                </Box>
              </Card>
            </Box>
          )}

          {/* Style 2: pastel full-width hero left text right input */}
          {style === "style2" && (
            <Box
              sx={{
                borderRadius: 2,
                p: 4,
                background: bgImage ? `url(${bgImage}) center/cover` : bgColor,
                color: bgImage ? "#fff" : "#111827",
              }}
            >
              <Box sx={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
                <Box sx={{ flex: 1, minWidth: 260 }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                    {headline}
                  </Typography>
                  <Typography sx={{ color: "text.secondary", mb: 2 }}>
                    {subheading}
                  </Typography>
                </Box>

                <Box sx={{ minWidth: 320 }}>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Enter a valid email address"
                      value={previewEmail}
                      onChange={(e) => setPreviewEmail(e.target.value)}
                      fullWidth
                    />
                    <Button variant="contained">{buttonLabel}</Button>
                  </Box>
                  {showPrivacy && (
                    <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
                      By subscribing, you agree to our privacy policy.
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          )}

          {/* Style 3: centered modal with big CTA (green background) */}
          {style === "style3" && (
            <Box
              sx={{
                display: "grid",
                placeItems: "center",
                minHeight: 340,
                background: bgImage ? `url(${bgImage}) center/cover` : bgColor,
                color: "#fff",
                p: 4,
                borderRadius: 2,
              }}
            >
              <Card sx={{ width: "100%", maxWidth: 700, borderRadius: 3, p: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                  {headline}
                </Typography>
                <Typography sx={{ color: "text.secondary", mb: 2 }}>{subheading}</Typography>

                <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Ex. yourname@mycompany.com"
                    value={previewEmail}
                    onChange={(e) => setPreviewEmail(e.target.value)}
                    sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    mt: 1,
                    py: 1.5,
                    bgcolor: "#fb7185",
                    "&:hover": { bgcolor: "#fb6f7f" },
                  }}
                >
                  {buttonLabel}
                </Button>

                {showPrivacy && (
                  <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
                    By clicking the button you consent to receive emails.
                  </Typography>
                )}
              </Card>
            </Box>
          )}

          {/* Style 4: rounded dark card with blue CTA (compact centered) */}
          {style === "style4" && (
            <Box sx={{ display: "grid", placeItems: "center", minHeight: 260 }}>
              <Card sx={{ background: "#1f2937", color: "#fff", borderRadius: 3, p: 3, width: "100%", maxWidth: 560 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  {headline}
                </Typography>
                <Typography sx={{ color: "text.secondary", mb: 2 }}>{subheading}</Typography>

                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Your email address"
                    value={previewEmail}
                    onChange={(e) => setPreviewEmail(e.target.value)}
                    sx={{
                      flex: 1,
                      "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "rgba(255,255,255,0.06)" },
                      input: { color: "#fff" },
                    }}
                  />
                  <Button variant="contained" sx={{ bgcolor: "#3b82f6" }}>
                    {buttonLabel}
                  </Button>
                </Box>

                {showPrivacy && (
                  <Typography variant="caption" sx={{ display: "block", mt: 1, color: "rgba(255,255,255,0.7)" }}>
                    Your email is safe with us, we don't spam.
                  </Typography>
                )}
              </Card>
            </Box>
          )}

          {/* Style 5: navy modal (centered, wide) */}
          {style === "style5" && (
            <Box sx={{ display: "grid", placeItems: "center", minHeight: 340 }}>
              <Card sx={{ maxWidth: 760, width: "100%", borderRadius: 3, p: 4, background: "#071033", color: "#fff" }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, textAlign: "center" }}>
                  {headline}
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.85)", mb: 3, textAlign: "center" }}>{subheading}</Typography>

                <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                  <TextField
                    size="small"
                    placeholder="Ex. yourname@mycompany.com"
                    value={previewEmail}
                    onChange={(e) => setPreviewEmail(e.target.value)}
                    sx={{
                      flex: 1,
                      maxWidth: 420,
                      "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "rgba(255,255,255,0.06)" },
                      input: { color: "#fff" },
                    }}
                  />
                </Box>

                <Button variant="contained" fullWidth sx={{ mt: 3, py: 1.5, bgcolor: "#fb8c7e" }}>
                  {buttonLabel}
                </Button>

                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                  {showPrivacy ? (
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
                      I have read and accept the Privacy Policy.
                    </Typography>
                  ) : (
                    <span />
                  )}
                </Box>
              </Card>
            </Box>
          )}

          {/* Style 6: full-bleed image background hero with overlay */}
          {style === "style6" && (
            <Box
              sx={{
                borderRadius: 2,
                overflow: "hidden",
                position: "relative",
                minHeight: 320,
                background: bgImage ? `url(${bgImage}) center/cover no-repeat` : bgColor,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                p: 3,
              }}
            >
              <Box sx={{ width: "100%", backdropFilter: bgImage ? "blur(0px)" : "none" }}>
                <Box sx={{ maxWidth: 720 }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                    {headline}
                  </Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.9)", mb: 2 }}>{subheading}</Typography>

                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Enter your name"
                      sx={{ background: "rgba(255,255,255,0.9)", borderRadius: 1, flex: 1 }}
                    />
                    <TextField
                      size="small"
                      placeholder="Enter your email"
                      sx={{ background: "rgba(255,255,255,0.9)", borderRadius: 1, width: 240 }}
                      value={previewEmail}
                      onChange={(e) => setPreviewEmail(e.target.value)}
                    />
                    <Button variant="contained">{buttonLabel}</Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Newsletter;
