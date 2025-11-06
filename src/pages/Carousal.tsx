//src/pages/Carousal.tsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Chip,
  Alert,
  Collapse,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ClearIcon from "@mui/icons-material/ClearAll";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import SettingsIcon from "@mui/icons-material/Settings";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { PageProps } from "../types/routes";
/* ------------------------------
    BACKEND API CONFIG
    ------------------------------ */
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";
/* ------------------------------
    Types
    ------------------------------ */
export type Slide = {
  id: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  image?: string;
  darkOverlay?: boolean;
};
export type CarouselStyle = {
  id: string;
  name: string;
  description: string;
  type: "hero" | "card" | "uneven" | "center" | "bootstrap";
  sampleImage: string;
};
export type CarouselSize = {
  width: string;
  height: string;
};
export type CarouselProps = {
  slides: Slide[];
  onCTAClick?: (slide: Slide) => void;
  size: CarouselSize;
  interval: number;
};
/* ------------------------------
    Constants
    ------------------------------ */
const STORAGE_KEY = "user_carousel_config_pro_v11";
const PREVIEW_KEY = "preview_carousel";
const CAROUSEL_STYLES: CarouselStyle[] = [
  {
    id: "hero",
    name: "Hero Carousel",
    description: "Large banner style with overlay text",
    type: "hero",
    sampleImage: "https://images.unsplash.com/photo-1506765515384-028b60a970df?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "card",
    name: "Card Carousel",
    description: "Bootstrap-style cards in a carousel",
    type: "card",
    sampleImage: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "uneven",
    name: "Uneven Sets",
    description: "Different sized slides with finite scrolling",
    type: "uneven",
    sampleImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "center",
    name: "Center Mode",
    description: "Centered slides with partial preview",
    type: "center",
    sampleImage: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "bootstrap",
    name: "Bootstrap Style",
    description: "Classic Bootstrap carousel with customizable size",
    type: "bootstrap",
    sampleImage: "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=400&q=80",
  },
];
/* ------------------------------
    CAROUSEL COMPONENTS
    ------------------------------ */
function HeroCarousel({ slides, onCTAClick, size, interval }: CarouselProps) {
  const [index, setIndex] = useState(0);
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((s) => (s + 1) % slides.length);
    }, interval);
    return () => clearInterval(timer);
  }, [slides.length, interval]);
  if (!slides || slides.length === 0) {
    return (
      <Box
        sx={{
          width: size.width,
          height: size.height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "grey.100",
          borderRadius: 2,
          border: "2px dashed",
          borderColor: "grey.300",
        }}
      >
        <Typography variant="h6" color="grey.600">
          Add slides to get started
        </Typography>
      </Box>
    );
  }
  const active = slides[index];
  return (
    <Box
      sx={{
        width: size.width,
        height: size.height,
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          borderRadius: 2,
          overflow: "hidden",
          position: "relative",
          background: active.image
            ? `url(${active.image})`
            : "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: active.darkOverlay
              ? "rgba(0,0,0,0.5)"
              : "rgba(0,0,0,0.2)",
          }}
        />
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            p: 4,
            color: "white",
            textAlign: "center",
          }}
        >
          {active.title && (
            <Typography
              variant={isXs ? "h4" : "h3"}
              fontWeight={700}
              sx={{
                lineHeight: 1.2,
                mb: 2,
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              {active.title}
            </Typography>
          )}
          {active.subtitle && (
            <Typography
              variant={isXs ? "body1" : "h6"}
              sx={{
                mb: 3,
                opacity: 0.95,
                textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                maxWidth: "600px",
              }}
            >
              {active.subtitle}
            </Typography>
          )}
          {active.ctaText && (
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: "white",
                color: "primary.main",
                fontWeight: 600,
                "&:hover": { bgcolor: "grey.100" },
              }}
              onClick={() => {
                if (active.ctaHref) window.open(active.ctaHref, "_blank");
                if (onCTAClick) onCTAClick(active);
              }}
            >
              {active.ctaText}
            </Button>
          )}
        </Box>
        {slides.length > 1 && (
          <Box
            sx={{
              position: "absolute",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 5,
              display: "flex",
              gap: 1,
            }}
          >
            {slides.map((_, i) => (
              <Box
                key={i}
                onClick={() => setIndex(i)}
                sx={{
                  width: i === index ? 12 : 8,
                  height: i === index ? 12 : 8,
                  borderRadius: "50%",
                  bgcolor: i === index ? "white" : "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
function CardCarousel({ slides, onCTAClick, size, interval }: CarouselProps) {
  const [index, setIndex] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((s) => (s + 1) % slides.length);
    }, interval);
    return () => clearInterval(timer);
  }, [slides.length, interval]);
  if (!slides || slides.length === 0) {
    return (
      <Box
        sx={{
          width: size.width,
          height: size.height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "grey.100",
          borderRadius: 2,
          border: "2px dashed",
          borderColor: "grey.300",
        }}
      >
        <Typography variant="h6" color="grey.600">
          Add cards to display in carousel
        </Typography>
      </Box>
    );
  }
  const active = slides[index];
  return (
    <Box
      sx={{
        width: size.width,
        height: size.height,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card
        elevation={3}
        sx={{
          width: isMobile ? "90%" : 400,
          height: isMobile ? "70%" : 350,
          borderRadius: 2,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {active.image && (
          <Box
            sx={{
              height: "60%",
              backgroundImage: `url(${active.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}
        <CardContent
          sx={{
            p: 3,
            height: "40%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box>
            {active.title && (
              <Typography variant="h5" component="h2" gutterBottom>
                {active.title}
              </Typography>
            )}
            {active.subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {active.subtitle}
              </Typography>
            )}
          </Box>
          {active.ctaText && (
            <Button
              variant="contained"
              onClick={() => {
                if (active.ctaHref) window.open(active.ctaHref, "_blank");
                if (onCTAClick) onCTAClick(active);
              }}
              sx={{ mt: 1 }}
            >
              {active.ctaText}
            </Button>
          )}
        </CardContent>
      </Card>
      {slides.length > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 3, gap: 2 }}>
          <Button
            size="small"
            data-carousel-prev
            onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
          >
            Previous
          </Button>
          <Typography variant="body2" color="text.secondary">
            {index + 1} of {slides.length}
          </Typography>
          <Button
            size="small"
            data-carousel-next
            onClick={() => setIndex((i) => (i + 1) % slides.length)}
          >
            Next
          </Button>
        </Box>
      )}
    </Box>
  );
}
function UnevenCarousel({ slides, onCTAClick, size, interval }: CarouselProps) {
  const [index, setIndex] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const slideWidths = [280, 320, 280, 320, 280];
  if (!slides || slides.length === 0) {
    return (
      <Box
        sx={{
          width: size.width,
          height: size.height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "grey.100",
          borderRadius: 2,
          border: "2px dashed",
          borderColor: "grey.300",
        }}
      >
        <Typography variant="h6" color="grey.600">
          Add slides to display in carousel
        </Typography>
      </Box>
    );
  }
  const handleNext = () => {
    setIndex((prev) => (prev + 1) % slides.length);
  };
  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };
  return (
    <Box
      sx={{
        width: size.width,
        height: size.height,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {slides.length > 1 && (
        <>
          <IconButton
            onClick={handlePrev}
            data-carousel-prev
            sx={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 2,
              bgcolor: "background.paper",
              boxShadow: 2,
              "&:hover": { bgcolor: "primary.main", color: "white" },
            }}
          >
            <NavigateBeforeIcon />
          </IconButton>
          <IconButton
            onClick={handleNext}
            data-carousel-next
            sx={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 2,
              bgcolor: "background.paper",
              boxShadow: 2,
              "&:hover": { bgcolor: "primary.main", color: "white" },
            }}
          >
            <NavigateNextIcon />
          </IconButton>
        </>
      )}
      <Box
        sx={{
          display: "flex",
          overflowX: "auto",
          gap: 2,
          py: 2,
          px: 4,
          scrollSnapType: "x mandatory",
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
        }}
      >
        {slides.map((slide, i) => (
          <Box
            key={slide.id}
            sx={{
              minWidth: slideWidths[i % slideWidths.length],
              height: "100%",
              backgroundImage: `url(${slide.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: 2,
              scrollSnapAlign: "center",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              textAlign: "center",
              p: 2,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: slide.darkOverlay ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.2)",
                borderRadius: 2,
              }}
            />
            <Box sx={{ position: "relative", zIndex: 1 }}>
              {slide.title && <Typography variant="h6">{slide.title}</Typography>}
              {slide.subtitle && <Typography variant="body2">{slide.subtitle}</Typography>}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
function CenterCarousel({ slides, onCTAClick, size, interval }: CarouselProps) {
  const [index, setIndex] = useState(0);
  const theme = useTheme();
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((s) => (s + 1) % slides.length);
    }, interval);
    return () => clearInterval(timer);
  }, [slides.length, interval]);
  if (!slides || slides.length === 0) {
    return (
      <Box
        sx={{
          width: size.width,
          height: size.height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "grey.100",
          borderRadius: 2,
          border: "2px dashed",
          borderColor: "grey.300",
        }}
      >
        <Typography variant="h6" color="grey.600">
          Add slides to display
        </Typography>
      </Box>
    );
  }
  return (
    <Box
      sx={{
        width: size.width,
        height: size.height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {slides.map((slide, i) => {
        const offset = i - index;
        const scale = offset === 0 ? 1 : 0.8;
        const opacity = offset === 0 ? 1 : 0.6;
        const zIndex = offset === 0 ? 10 : 5;
        return (
          <Box
            key={slide.id}
            sx={{
              position: "absolute",
              width: "70%",
              height: "80%",
              transform: `translateX(${offset * 60}%) scale(${scale})`,
              opacity,
              zIndex,
              transition: "all 0.5s ease",
              backgroundImage: `url(${slide.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              textAlign: "center",
            }}
          >
            <Box sx={{ p: 3 }}>
              {slide.title && <Typography variant="h5">{slide.title}</Typography>}
              {slide.subtitle && <Typography variant="body1">{slide.subtitle}</Typography>}
            </Box>
          </Box>
        );
      })}
      <Box sx={{ mt: 4, display: "flex", gap: 1 }}>
        {slides.map((_, i) => (
          <Box
            key={i}
            onClick={() => setIndex(i)}
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: i === index ? "primary.main" : "grey.400",
              cursor: "pointer",
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
function BootstrapCarousel({ slides, onCTAClick, size, interval }: CarouselProps) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((s) => (s + 1) % slides.length);
    }, interval);
    return () => clearInterval(timer);
  }, [slides.length, interval]);
  if (!slides || slides.length === 0) {
    return (
      <Box
        sx={{
          width: size.width,
          height: size.height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "grey.100",
          borderRadius: 2,
          border: "2px dashed",
          borderColor: "grey.300",
        }}
      >
        <Typography variant="h6" color="grey.600">
          Add slides to bootstrap carousel
        </Typography>
      </Box>
    );
  }
  return (
    <Box
      sx={{
        width: size.width,
        height: size.height,
        position: "relative",
        overflow: "hidden",
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: "100%",
          height: "100%",
          transition: "transform 0.5s ease",
          transform: `translateX(-${index * 100}%)`,
        }}
      >
        {slides.map((slide) => (
          <Box
            key={slide.id}
            sx={{
              minWidth: "100%",
              height: "100%",
              backgroundImage: `url(${slide.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              textAlign: "center",
              p: 4,
            }}
          >
            <Box
              sx={{
                backgroundColor: slide.darkOverlay ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.2)",
                p: 3,
                borderRadius: 2,
                maxWidth: "80%",
              }}
            >
              {slide.title && <Typography variant="h4">{slide.title}</Typography>}
              {slide.subtitle && <Typography variant="h6" sx={{ mt: 1 }}>{slide.subtitle}</Typography>}
              {slide.ctaText && (
                <Button
                  variant="contained"
                  color="secondary"
                  sx={{ mt: 2 }}
                  onClick={() => {
                    if (slide.ctaHref) window.open(slide.ctaHref, "_blank");
                    if (onCTAClick) onCTAClick(slide);
                  }}
                >
                  {slide.ctaText}
                </Button>
              )}
            </Box>
          </Box>
        ))}
      </Box>
      {slides.length > 1 && (
        <>
          <IconButton
            onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
            data-carousel-prev
            sx={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: "rgba(0,0,0,0.5)",
              color: "white",
              "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
            }}
          >
            <NavigateBeforeIcon />
          </IconButton>
          <IconButton
            onClick={() => setIndex((i) => (i + 1) % slides.length)}
            data-carousel-next
            sx={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: "rgba(0,0,0,0.5)",
              color: "white",
              "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
            }}
          >
            <NavigateNextIcon />
          </IconButton>
        </>
      )}
    </Box>
  );
}
/* ------------------------------
    MAIN PAGE
    ------------------------------ */
export default function Carousal({ setSelectedModule }: PageProps) {
  const [selectedStyle, setSelectedStyle] = useState<CarouselStyle | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [carouselId, setCarouselId] = useState<string | null>(null);
  const [carouselSiteId, setCarouselSiteId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clearDialog, setClearDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [sizeSettingsOpen, setSizeSettingsOpen] = useState(false);
  const [slideIntervalMs, setSlideIntervalMs] = useState<number>(5000);
  const [slideIntervalSec, setSlideIntervalSec] = useState<number>(5);
  const [prevSlideIntervalSec, setPrevSlideIntervalSec] = useState<number>(5);
  const [showMaxError, setShowMaxError] = useState(false);
  const [showInvalidInputAlert, setShowInvalidInputAlert] = useState(false);
  const [showSaveAlert, setShowSaveAlert] = useState(false);
  const [carouselSize, setCarouselSize] = useState<CarouselSize>({
    width: "100%",
    height: "500px",
  });
  const [form, setForm] = useState<Slide>({
    id: Date.now().toString(),
    title: "",
    subtitle: "",
    ctaText: "",
    ctaHref: "",
    image: "",
    darkOverlay: true,
  });
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const saveButtonRef = useRef<HTMLButtonElement | null>(null);
  const invalidInputOkButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // ==================== Utility: persist current state to localStorage ====================
  const persistLocal = (opts?: {
    selectedStyle?: CarouselStyle | null;
    slides?: Slide[];
    carouselSize?: CarouselSize;
    slideInterval?: number;
    carouselSiteId?: string;
    carouselId?: string | null;
  }) => {
    const payload = {
      selectedStyle: opts?.selectedStyle ?? selectedStyle,
      slides: opts?.slides ?? slides,
      carouselSize: opts?.carouselSize ?? carouselSize,
      slideInterval: opts?.slideInterval ?? slideIntervalMs,
      carouselSiteId: opts?.carouselSiteId ?? carouselSiteId,
      carouselId: opts?.carouselId ?? carouselId,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore (quota, private mode, etc)
    }
  };

  // ==================== API CALLS ====================
  const saveToBackend = async () => {
    if (slides.length === 0) {
      setError("Add at least one slide");
      return;
    }
    if (!selectedStyle) return;
    if (!carouselSiteId.trim()) {
      setError("Carousel Site ID is required!");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    const currentUserId = 1;
    try {
      let finalCarouselId = carouselId;
      if (!carouselId) {
        const createPayload = {
          userId: currentUserId,
          styleType: selectedStyle.type,
          name: `${selectedStyle.name} - ${new Date().toLocaleDateString()}`,
          width: carouselSize.width,
          height: carouselSize.height,
          intervalMs: slideIntervalMs,
          carouselSiteId: carouselSiteId.trim(),
        };
        const createRes = await fetch(`${API_BASE_URL}/carousels`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(createPayload),
        });
        if (!createRes.ok) throw new Error(await createRes.text());
        const data = await createRes.json();
        finalCarouselId = data.id;
        setCarouselId(finalCarouselId);
      }
      const completePayload = {
        width: carouselSize.width,
        height: carouselSize.height,
        intervalMs: slideIntervalMs,
        slides: slides.map((s, i) => ({
          position: i,
          title: s.title || null,
          subtitle: s.subtitle || null,
          ctaText: s.ctaText || null,
          ctaHref: s.ctaHref || null,
          imageUrl: s.image || null,
          darkOverlay: s.darkOverlay ?? true,
        })),
      };
      const saveRes = await fetch(`${API_BASE_URL}/carousels/${finalCarouselId}/complete-save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(completePayload),
      });
      if (!saveRes.ok) throw new Error(await saveRes.text());
      setSuccess("Carousels are saved!");
      setIsSaved(true);

      // persist backend-saved state to localStorage so UI survives refresh/navigation
      persistLocal({
        selectedStyle,
        slides,
        carouselSize,
        slideInterval: slideIntervalMs,
        carouselSiteId,
        carouselId: finalCarouselId,
      });

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
      setIsSaved(false);
    } finally {
      setSaving(false);
    }
  };
  const loadFromBackend = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/carousels/${id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      const style = CAROUSEL_STYLES.find((s) => s.type === data.styleType) || CAROUSEL_STYLES[0];
      setSelectedStyle(style);
      setCarouselId(data.id);
      setCarouselSiteId(data.carouselSiteId || "");
      setCarouselSize({ width: data.width, height: data.height });
      setSlideIntervalMs(data.intervalMs);
      setSlideIntervalSec(data.intervalMs / 1000);
      setPrevSlideIntervalSec(data.intervalMs / 1000);
      const mapped = (data.slides || []).map((s: any) => ({
        id: s.id?.toString() || Date.now().toString(),
        title: s.title,
        subtitle: s.subtitle,
        ctaText: s.ctaText,
        ctaHref: s.ctaHref,
        image: s.imageUrl,
        darkOverlay: s.darkOverlay,
      }));
      setSlides(mapped);
      setIsSaved(true);

      // also persist what we loaded so editor UI keeps it across refresh/navigation
      persistLocal({
        selectedStyle: style,
        slides: mapped,
        carouselSize: { width: data.width, height: data.height },
        slideInterval: data.intervalMs,
        carouselSiteId: data.carouselSiteId || "",
        carouselId: data.id,
      });
    } catch (err: any) {
      setError("Failed to load");
    } finally {
      setLoading(false);
    }
  };

  // ==================== EFFECTS ====================
  // loadInitialState: read PREVIEW_KEY (if present) first, then STORAGE_KEY
  const loadInitialState = useCallback(() => {
    try {
      // 1) If preview exists (Your Layout may write), prefer that (but only if it's valid)
      const previewRaw = localStorage.getItem(PREVIEW_KEY);
      if (previewRaw) {
        try {
          const parsed = JSON.parse(previewRaw);
          // preview may include carouselId/selectedStyle/slides etc
          if (parsed) {
            if (parsed.selectedStyle) setSelectedStyle(parsed.selectedStyle);
            if (Array.isArray(parsed.slides)) setSlides(parsed.slides);
            if (parsed.carouselSize) setCarouselSize(parsed.carouselSize);
            if (parsed.slideIntervalMs !== undefined) {
              setSlideIntervalMs(parsed.slideIntervalMs);
              setSlideIntervalSec(parsed.slideIntervalMs / 1000);
              setPrevSlideIntervalSec(parsed.slideIntervalMs / 1000);
            } else if (parsed.slideInterval !== undefined) {
              setSlideIntervalMs(parsed.slideInterval);
              setSlideIntervalSec(parsed.slideInterval / 1000);
              setPrevSlideIntervalSec(parsed.slideInterval / 1000);
            }
            if (parsed.carouselSiteId) setCarouselSiteId(parsed.carouselSiteId);
            if (parsed.carouselId) setCarouselId(parsed.carouselId);
            // persist preview into normal storage so editor uses it going forward
            persistLocal({
              selectedStyle: parsed.selectedStyle,
              slides: parsed.slides,
              carouselSize: parsed.carouselSize,
              slideInterval: parsed.slideIntervalMs ?? parsed.slideInterval,
              carouselSiteId: parsed.carouselSiteId,
              carouselId: parsed.carouselId,
            });
            return;
          }
        } catch {
          // malformed preview -> ignore
        }
      }

      // 2) fallback: read our saved editor state
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.selectedStyle) setSelectedStyle(parsed.selectedStyle);
        if (Array.isArray(parsed.slides)) setSlides(parsed.slides);
        if (parsed.carouselSize) setCarouselSize(parsed.carouselSize);
        if (parsed.slideInterval !== undefined) {
          const ms = parsed.slideInterval;
          setSlideIntervalMs(ms);
          setSlideIntervalSec(ms / 1000);
          setPrevSlideIntervalSec(ms / 1000);
        }
        if (parsed.carouselSiteId) setCarouselSiteId(parsed.carouselSiteId);
        if (parsed.carouselId) setCarouselId(parsed.carouselId);
      }
    } catch {
      // ignore
    }
  }, []);

  // On component mount: if URL has ?id= -> load from backend (and persist).
  // Otherwise load initial state from localStorage (and preview if any).
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    if (id) {
      loadFromBackend(id);
    } else {
      // DO NOT remove local storage here; load persisted state
      loadInitialState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // persist any editor changes into localStorage automatically
  useEffect(() => {
    persistLocal();
    // mark as unsaved if user changes
    if (isSaved) setIsSaved(false);
    // we do not put persistLocal in dependencies to avoid infinite loop; it's stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStyle, slides, carouselSize, slideIntervalMs, carouselSiteId]);

  // ==================== HANDLERS ====================
  function openAdd() {
    setEditingIndex(null);
    setForm({
      id: Date.now().toString(),
      title: "",
      subtitle: "",
      ctaText: "",
      ctaHref: "",
      image: "",
      darkOverlay: true,
    });
    setDialogOpen(true);
  }
  function openEdit(idx: number) {
    setEditingIndex(idx);
    setForm({ ...slides[idx] });
    setDialogOpen(true);
  }
  const handleSave = () => {
    const hasContent = form.title?.trim() || form.image?.trim() || form.subtitle?.trim() || form.ctaText?.trim();
    if (!hasContent) {
      alert("Please enter at least a title or an image URL for the slide");
      return;
    }
    if (editingIndex === null) {
      const newSlides = [...slides, { ...form, id: form.id || Date.now().toString() }];
      setSlides(newSlides);
      persistLocal({ slides: newSlides });
    } else {
      const newSlides = slides.map((it, i) => (i === editingIndex ? { ...form } : it));
      setSlides(newSlides);
      persistLocal({ slides: newSlides });
    }
    setDialogOpen(false);
  };
  function remove(idx: number) {
    const newSlides = slides.filter((_, i) => i !== idx);
    setSlides(newSlides);
    persistLocal({ slides: newSlides });
  }
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };
  const handleDragLeave = () => {
    setDragOverIndex(null);
  };
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    const newSlides = [...slides];
    const [draggedSlide] = newSlides.splice(draggedIndex, 1);
    newSlides.splice(dropIndex, 0, draggedSlide);
    setSlides(newSlides);
    persistLocal({ slides: newSlides });
    setDraggedIndex(null);
    setDragOverIndex(null);
  };
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((f) => ({ ...f, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else if (file) {
      alert("Only image files are supported.");
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const handlePreviewCarousel = () => {
    if (slides.length === 0) {
      setError("Add slides to preview");
      return;
    }
    if (!isSaved) {
      setShowSaveAlert(true);
      return;
    }
    const previewData = { carouselId, selectedStyle, slides, carouselSize, slideIntervalMs, carouselSiteId };
    try {
      localStorage.setItem(PREVIEW_KEY, JSON.stringify(previewData));
    } catch {
      // ignore
    }
    setSuccess("Carousel preview saved! Check Your Layout.");
    setTimeout(() => setSuccess(null), 3000);
  };
  const handleClearAll = async () => {
    // If there is no slide -> show an error (No slides to clear)
    if (slides.length === 0) {
      setClearDialog(false);
      setError("No slides to clear");
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Clear any previous error before attempting deletion
    setError(null);

    if (carouselId) {
      try {
        const res = await fetch(`${API_BASE_URL}/carousels/${carouselId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to delete carousel");
      } catch (err: any) {
        setError(err.message);
        setTimeout(() => setError(null), 3000);
        return;
      }
    }

    // clear editor state and storage (including preview)
    setSlides([]);
    setCarouselId(null);
    setCarouselSiteId("");
    setCarouselSize({ width: "100%", height: "500px" });
    setSlideIntervalMs(5000);
    setSlideIntervalSec(5);
    setPrevSlideIntervalSec(5);
    setIsSaved(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PREVIEW_KEY);
    } catch { /* ignore */ }
    setClearDialog(false);
    setError(null);
    setSuccess("All content cleared! Start fresh.");
    setTimeout(() => setSuccess(null), 3000);
  };

  const renderCarousel = () => {
    if (!selectedStyle) return null;
    const key = `${selectedStyle.id}-${slides.length}-${slideIntervalMs}`;
    switch (selectedStyle.type) {
      case "hero":
        return <HeroCarousel key={key} slides={slides} size={carouselSize} interval={slideIntervalMs} />;
      case "card":
        return <CardCarousel key={key} slides={slides} size={carouselSize} interval={slideIntervalMs} />;
      case "uneven":
        return <UnevenCarousel key={key} slides={slides} size={carouselSize} interval={slideIntervalMs} />;
      case "center":
        return <CenterCarousel key={key} slides={slides} size={carouselSize} interval={slideIntervalMs} />;
      case "bootstrap":
        return <BootstrapCarousel key={key} slides={slides} size={carouselSize} interval={slideIntervalMs} />;
      default:
        return <HeroCarousel key={key} slides={slides} size={carouselSize} interval={slideIntervalMs} />;
    }
  };
  const handleIntervalSecChange = (valueStr: string) => {
    const numericRegex = /^[0-9]*\.?[0-9]*$/;
    if (valueStr.trim() !== "" && !numericRegex.test(valueStr)) {
      setShowInvalidInputAlert(true);
      return;
    }
    if (valueStr.trim() === "") {
      setSlideIntervalSec(NaN);
      return;
    }
    const parsed = Number(valueStr);
    if (Number.isNaN(parsed)) return;
    if (parsed > 7) {
      setShowMaxError(true);
      setSlideIntervalSec(prevSlideIntervalSec);
      return;
    }
    const clamped = Math.max(1, parsed);
    setPrevSlideIntervalSec(clamped);
    setSlideIntervalSec(clamped);
    setSlideIntervalMs(clamped * 1000);
    persistLocal({ slideInterval: clamped * 1000 });
  };
  const handleIntervalBlur = () => {
    if (!Number.isFinite(slideIntervalSec) || slideIntervalSec < 1) {
      setSlideIntervalSec(prevSlideIntervalSec);
      setSlideIntervalMs(prevSlideIntervalSec * 1000);
    } else {
      setPrevSlideIntervalSec(slideIntervalSec);
      setSlideIntervalMs(slideIntervalSec * 1000);
    }
  };
  const applyPresetSeconds = (secs: number) => {
    const safe = Math.min(7, Math.max(1, secs));
    if (secs > 7) {
      setShowMaxError(true);
      return;
    }
    setPrevSlideIntervalSec(safe);
    setSlideIntervalSec(safe);
    setSlideIntervalMs(safe * 1000);
    persistLocal({ slideInterval: safe * 1000 });
  };
  const handleCloseSnackbar = (_: any, reason?: string) => {
    if (reason === "clickaway") return;
    setShowMaxError(false);
  };
  const handleGlobalKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!saving) saveToBackend();
        return;
      }
      if (dialogOpen) {
        if (e.key === "Escape") {
          e.preventDefault();
          setDialogOpen(false);
        } else if (e.key === "Enter") {
          e.preventDefault();
          handleSave();
        }
        return;
      }
      if (clearDialog) {
        if (e.key === "Escape") {
          e.preventDefault();
          setClearDialog(false);
        } else if (e.key === "Enter") {
          e.preventDefault();
          handleClearAll();
        }
        return;
      }
      if (showInvalidInputAlert) {
        if (e.key === "Enter" || e.key === "Escape") {
          e.preventDefault();
          setShowInvalidInputAlert(false);
        }
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const targetAttr = e.key === "ArrowLeft" ? "[data-carousel-prev]" : "[data-carousel-next]";
        const btn = document.querySelector<HTMLButtonElement | HTMLButtonElement>(targetAttr);
        if (btn) {
          e.preventDefault();
          (btn as HTMLElement).click();
        }
      }
    },
    [dialogOpen, clearDialog, showInvalidInputAlert, saving, handleSave, handleClearAll, saveToBackend]
  );
  useEffect(() => {
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [handleGlobalKeyDown]);

  // ==================== RENDER ====================
  if (!selectedStyle) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, margin: "0 auto" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <IconButton onClick={() => setSelectedModule("home")}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" fontWeight="bold" textAlign="center">
            Choose Your Carousel Style
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
          Select a style that matches your website's design
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {CAROUSEL_STYLES.map((style) => (
            <Grid  key={style.id} >
              <Card
                sx={{
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
                }}
                onClick={() => {
                  setSelectedStyle(style);
                  loadInitialState();
                }}
              >
                <Box
                  sx={{
                    height: 160,
                    backgroundImage: `url(${style.sampleImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>{style.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {style.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }
  return (
    <Box sx={{ p: 0 }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          top: 0,
          zIndex: 100,
          boxShadow: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton onClick={() => setSelectedStyle(null)}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {selectedStyle.name} Editor
            </Typography>
            {isSaved && (
              <Chip label="Saved" size="small" color="success" sx={{ fontWeight: 600 }} />
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Button variant="outlined" onClick={() => setSelectedStyle(null)} sx={{ borderRadius: 2 }}>
              Change Style
            </Button>
            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={saveToBackend}
              disabled={saving || slides.length === 0 || !carouselSiteId.trim()}
              ref={saveButtonRef}
              sx={{
                borderRadius: 3,
                px: 4,
                fontWeight: 700,
                boxShadow: 3,
                "&:hover": { boxShadow: 6 },
                minWidth: 200,
              }}
            >
              {saving ? <CircularProgress size={24} color="inherit" /> : "Save Carousels"}
            </Button>
          </Box>
        </Box>
      </Box>
      {/* Carousel Site ID Input */}
      <Box sx={{ p: 2, bgcolor: "background.paper", borderBottom: 1, borderColor: "divider" }}>
        <TextField
          fullWidth
          label="Carousel Site ID (Required)"
          value={carouselSiteId}
          onChange={(e) => {
            setCarouselSiteId(e.target.value);
            persistLocal({ carouselSiteId: e.target.value });
          }}
          error={slides.length > 0 && !carouselSiteId.trim()}
          helperText={slides.length > 0 && !carouselSiteId.trim() ? "Required to save" : "Used to load carousel on specific page"}
          size="small"
          sx={{ maxWidth: 500 }}
        />
      </Box>
      {/* Alerts */}
      <Collapse in={!!error && slides.length === 0}>
        <Alert severity="warning" sx={{ borderRadius: 2, m: 2 }}>
          No Slides To Delete
        </Alert>
      </Collapse>
      <Collapse in={!!success}>
        <Alert severity="success" sx={{ borderRadius: 2, m: 2 }}>
          {success} {carouselId && `(ID: ${carouselId})`}
        </Alert>
      </Collapse>
      <Collapse in={!!error && slides.length > 0}>
        <Alert severity="error" sx={{ borderRadius: 2, m: 2 }}>{error}</Alert>
      </Collapse>
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          {success}
        </Alert>
      </Snackbar>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ display: "block" }}>
            <Box
              sx={{
                display: "flex",
                borderBottom: 1,
                borderColor: "divider",
                minHeight: 400,
                flexShrink: 0,
                flexWrap: { xs: "wrap", md: "nowrap" },
                alignItems: "stretch",
              }}
            >
              <Box
                sx={{
                  flex: { xs: "0 0 100%", md: "0 0 33.33%" },
                  borderRight: { xs: "none", md: 1 },
                  borderBottom: { xs: 1, md: "none" },
                  borderColor: "divider",
                  overflow: "visible",
                  bgcolor: "background.paper",
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <Typography variant="h5">Carousel Editor</Typography>
                    <Button startIcon={<AddIcon />} onClick={openAdd} variant="contained" size="medium" sx={{ borderRadius: 2 }}>
                      Add Slide
                    </Button>
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                      <Typography variant="h6">Slides ({slides.length})</Typography>
                      <Chip label={`${slides.length} slide${slides.length !== 1 ? "s" : ""}`} size="small" color="primary" variant="outlined" />
                    </Box>
                    {slides.length === 0 ? (
                      <Alert severity="info" sx={{ borderRadius: 2 }}>
                        No slides added yet. Click "Add Slide" to create your first slide.
                      </Alert>
                    ) : (
                      <List sx={{ maxHeight: 250, overflow: "auto", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                        {slides.map((slide, idx) => (
                          <ListItem
                            key={slide.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, idx)}
                            onDragOver={(e) => handleDragOver(e, idx)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, idx)}
                            sx={{
                              borderBottom: idx < slides.length - 1 ? "1px solid" : "none",
                              borderColor: "divider",
                              "&:hover": { bgcolor: "action.hover" },
                              transition: "all 0.3s ease",
                              cursor: "grab",
                              "&:active": { cursor: "grabbing" },
                              bgcolor: dragOverIndex === idx ? "action.selected" : "transparent",
                              transform: draggedIndex === idx ? "scale(0.95)" : "scale(1)",
                              opacity: draggedIndex === idx ? 0.5 : 1,
                            }}
                            secondaryAction={
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <IconButton edge="end" onClick={() => openEdit(idx)} size="small" color="primary">
                                  <EditIcon />
                                </IconButton>
                                <IconButton edge="end" onClick={() => remove(idx)} size="small" color="error">
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            }
                          >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
                              <DragIndicatorIcon sx={{ color: "action.active", cursor: "grab" }} />
                              <ListItemText
                                primary={
                                  <Typography variant="subtitle2" fontWeight="medium">
                                    #{idx + 1}: {slide.title || "Untitled Slide"}
                                  </Typography>
                                }
                                secondary={
                                  <Typography variant="body2" color="text.secondary">
                                    {slide.subtitle || (slide.image ? "Image slide" : "No content")}
                                  </Typography>
                                }
                              />
                            </Box>
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <Button variant="contained" startIcon={<VisibilityIcon />} onClick={handlePreviewCarousel} disabled={slides.length === 0} sx={{ borderRadius: 2, flex: 1 }}>
                      Preview Carousel
                    </Button>
                    <Button variant="outlined" color="error" startIcon={<ClearIcon />} onClick={() => setClearDialog(true)} sx={{ borderRadius: 2 }}>
                      Clear
                    </Button>
                  </Box>
                </Box>
              </Box>
              <Box
                sx={{
                  flex: { xs: "0 0 100%", md: "0 0 33.33%" },
                  borderRight: { xs: "none", md: 1 },
                  borderBottom: { xs: 1, md: "none" },
                  borderColor: "divider",
                  overflow: "visible",
                  bgcolor: "background.paper",
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Typography variant="h5" sx={{ mb: 3 }}>Carousel Size Settings</Typography>
                  <Box sx={{ mb: 3 }}>
                    <Button
                      fullWidth
                      startIcon={<SettingsIcon />}
                      endIcon={sizeSettingsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      onClick={() => setSizeSettingsOpen(!sizeSettingsOpen)}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    >
                      Size Configuration
                    </Button>
                    <Collapse in={sizeSettingsOpen}>
                      <Box sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 1, bgcolor: "grey.50" }}>
                        <Typography variant="subtitle2" gutterBottom>Customize Carousel Dimensions</Typography>
                        <Grid container spacing={2}>
                          <Grid >
                            <TextField
                              fullWidth
                              label="Width"
                              value={carouselSize.width}
                              onChange={(e) => {
                                setCarouselSize((prev) => ({ ...prev, width: e.target.value }));
                                persistLocal({ carouselSize: { ...carouselSize, width: e.target.value } });
                              }}
                              size="small"
                              placeholder="100%"
                              helperText="e.g., 100%, 800px"
                            />
                          </Grid>
                          <Grid >
                            <TextField
                              fullWidth
                              label="Height"
                              value={carouselSize.height}
                              onChange={(e) => {
                                setCarouselSize((prev) => ({ ...prev, height: e.target.value }));
                                persistLocal({ carouselSize: { ...carouselSize, height: e.target.value } });
                              }}
                              size="small"
                              placeholder="500px"
                              helperText="e.g., 500px, 50vh"
                            />
                          </Grid>
                        </Grid>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>Quick Size Presets</Typography>
                          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                            <Button size="small" variant="outlined" onClick={() => { setCarouselSize({ width: "100%", height: "400px" }); persistLocal({ carouselSize: { width: "100%", height: "400px" } }); }}>Small</Button>
                            <Button size="small" variant="outlined" onClick={() => { setCarouselSize({ width: "100%", height: "500px" }); persistLocal({ carouselSize: { width: "100%", height: "500px" } }); }}>Medium</Button>
                            <Button size="small" variant="outlined" onClick={() => { setCarouselSize({ width: "100%", height: "600px" }); persistLocal({ carouselSize: { width: "100%", height: "600px" } }); }}>Large</Button>
                          </Box>
                        </Box>
                      </Box>
                    </Collapse>
                  </Box>
                </Box>
              </Box>
              <Box
                sx={{
                  flex: { xs: "0 0 100%", md: "0 0 33.33%" },
                  overflow: "visible",
                  borderBottom: { xs: 1, md: "none" },
                  borderColor: "divider",
                  bgcolor: "background.paper",
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Typography variant="h5" sx={{ mb: 3 }}>Time Interval Settings</Typography>
                  <Box sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 1, bgcolor: "grey.50" }}>
                    <Typography variant="subtitle2" gutterBottom>Slide Duration (in seconds)</Typography>
                    <TextField
                      fullWidth
                      label="Interval (Seconds)"
                      type="text"
                      value={Number.isFinite(slideIntervalSec) ? slideIntervalSec : ""}
                      onChange={(e) => handleIntervalSecChange(e.target.value)}
                      onBlur={handleIntervalBlur}
                      size="small"
                      placeholder="5"
                      helperText="Minimum recommended time is 1 second. Maximum 7 seconds."
                      inputProps={{ min: 1, max: 7, step: 0.5 }}
                    />
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Quick Presets</Typography>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Button size="small" variant="outlined" onClick={() => applyPresetSeconds(3)}>3s</Button>
                        <Button size="small" variant="outlined" onClick={() => applyPresetSeconds(5)}>5s (Default)</Button>
                        <Button size="small" variant="outlined" onClick={() => applyPresetSeconds(7)}>7s</Button>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box sx={{ overflow: "visible", p: 4, bgcolor: "grey.50", display: "block" }}>
              <Typography variant="h5" fontWeight="medium" sx={{ mb: 2 }}>Live Preview</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Changes are saved manually. Click 'Save Carousels' to persist.
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                {renderCarousel()}
              </Box>
            </Box>
          </Box>
          <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                setDialogOpen(false);
              } else if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                handleSave();
              }
            }}
          >
            <DialogTitle sx={{ pb: 1 }}>
              {editingIndex === null ? "Create New Slide" : `Edit Slide #${editingIndex! + 1}`}
            </DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
              <Box component="form" noValidate autoComplete="off">
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>Slide Text Content</Typography>
                <TextField margin="dense" id="title" label="Main headline for your slide" type="text" fullWidth variant="outlined" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
                <TextField margin="dense" id="subtitle" label="Subtitle" type="text" fullWidth variant="outlined" value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} />
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>Background Image</Typography>
                <TextField margin="dense" id="image" label="Background Image URL" type="url" fullWidth variant="outlined" value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} helperText="High-quality image URL or upload from computer below for best results" />
                <Box sx={{ mt: 1, mb: 2 }}>
                  <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleImageUpload} />
                  <Button variant="outlined" fullWidth startIcon={<CloudUploadIcon />} onClick={() => fileInputRef.current?.click()}>
                    UPLOAD FROM COMPUTER
                  </Button>
                  {form.image && (
                    <Box sx={{ mt: 2, p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Preview:</Typography>
                      <Box sx={{ height: 100, backgroundImage: `url(${form.image})`, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center", bgcolor: "grey.100" }} />
                    </Box>
                  )}
                </Box>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>Call-to-Action Button</Typography>
                <TextField margin="dense" id="ctaText" label="Button Text" type="text" variant="outlined" value={form.ctaText} onChange={(e) => setForm((f) => ({ ...f, ctaText: e.target.value }))} helperText="Text for call-to-action button" fullWidth />
                <TextField margin="dense" id="ctaHref" label="Button Link" type="url" variant="outlined" value={form.ctaHref} onChange={(e) => setForm((f) => ({ ...f, ctaHref: e.target.value }))} helperText="URL to open when button is clicked" fullWidth />
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, borderTop: 1, borderColor: "divider" }}>
              <Button onClick={() => setDialogOpen(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
              <Button ref={saveButtonRef} variant="contained" onClick={handleSave} sx={{ borderRadius: 2 }}>
                {editingIndex === null ? "Create Slide" : "Save Changes"}
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={clearDialog}
            onClose={() => setClearDialog(false)}
            PaperProps={{ sx: { borderRadius: 3 } }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                setClearDialog(false);
              } else if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                handleClearAll();
              }
            }}
          >
            <DialogTitle>Clear All Content?</DialogTitle>
            <DialogContent>
              <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                This will permanently remove all slides and reset settings.
              </Alert>
              <Typography>Are you sure you want to clear everything? This action cannot be undone.</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setClearDialog(false)}>Cancel</Button>
              <Button color="error" variant="contained" onClick={handleClearAll}>Clear Everything</Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={showInvalidInputAlert}
            onClose={() => setShowInvalidInputAlert(false)}
            PaperProps={{ sx: { borderRadius: 3 } }}
            onKeyDown={(e) => {
              if (e.key === "Escape" || e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                setShowInvalidInputAlert(false);
              }
            }}
          >
            <DialogTitle>Invalid Input</DialogTitle>
            <DialogContent>
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>Special characters are not allowed.</Alert>
              <Typography>Please enter a numeric value for the slide duration (1 to 7 seconds).</Typography>
            </DialogContent>
            <DialogActions>
              <Button ref={invalidInputOkButtonRef} onClick={() => setShowInvalidInputAlert(false)} variant="contained" sx={{ borderRadius: 2 }}>OK</Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={showSaveAlert}
            onClose={() => setShowSaveAlert(false)}
            PaperProps={{ sx: { borderRadius: 3 } }}
          >
            <DialogTitle>Please Save</DialogTitle>
            <DialogContent> 
              <Typography>Please save your slides before previewing.</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowSaveAlert(false)} variant="contained" sx={{ borderRadius: 2 }}>OK</Button>
            </DialogActions>
          </Dialog>
          <Snackbar open={showMaxError} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
            <Alert onClose={handleCloseSnackbar} severity="warning" sx={{ width: "100%" }}>Maximum allowed is 7 seconds.</Alert>
          </Snackbar>
        </>
      )}
    </Box>
  );
}

// THis is a new line for testing......