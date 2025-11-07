// src/pages/HomeModule.tsx
import React from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  IconButton,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ViewCarouselIcon from "@mui/icons-material/ViewCarousel";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CallIcon from "@mui/icons-material/Call";
import PeopleIcon from "@mui/icons-material/People";
import InfoIcon from "@mui/icons-material/Info";
import FooterIcon from "@mui/icons-material/ArrowDropDown";
import { PageProps } from "../types/routes";

const BigCard: React.FC<{
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  buttonLabel?: string;
}> = ({ title, subtitle, icon, onClick, buttonLabel = "Open" }) => (
  <Card sx={{ borderRadius: 2, boxShadow: 3, height: "100%" }}>
    <CardContent sx={{ p: { xs: 3, md: 4 } }}>
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <Box sx={{ fontSize: 36 }}>{icon}</Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Button
          variant="contained"
          onClick={onClick}
          disabled={!onClick}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            textTransform: "none",
            boxShadow: 2,
          }}
        >
          {buttonLabel}
        </Button>
      </Box>
    </CardContent>
  </Card>
);

const SmallCard: React.FC<{
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  comingSoon?: boolean;
  onClick?: () => void;
}> = ({ title, subtitle, icon, comingSoon = false, onClick }) => (
  <Card sx={{ borderRadius: 2, boxShadow: 1, height: "100%" }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 1 }}>
        <Box sx={{ fontSize: 28 }}>{icon}</Box>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      {subtitle && (
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          {subtitle}
        </Typography>
      )}
      <Button
        variant="outlined"
        disabled={comingSoon && !onClick}
        onClick={onClick}
        sx={{ textTransform: "none", borderRadius: 2 }}
      >
        {comingSoon ? "COMING SOON" : "Open"}
      </Button>
    </CardContent>
  </Card>
);

const HomeModule: React.FC<PageProps> = ({ setSelectedModule }) => {
  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <IconButton size="large" sx={{ bgcolor: "transparent" }}>
          <HomeIcon sx={{ fontSize: 34 }} />
        </IconButton>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>
            Welcome to CMS Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Build and customize your website components
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        {/* Top row: two large cards */}
        <Grid  >
          <BigCard
            title="NavBuilder"
            subtitle="Create and customize your website navigation bar with components"
            icon={<MenuBookIcon sx={{ color: "#6b7280" }} />}
            onClick={() => setSelectedModule && setSelectedModule("NavbarBuilderPage")}
            buttonLabel="Edit Navbar"
          />
        </Grid>

        <Grid >
          <BigCard
            title="Carousels"
            subtitle="Design beautiful image and content sliders"
            icon={<ViewCarouselIcon sx={{ color: "#8b5cf6" }} />}
            onClick={() => setSelectedModule && setSelectedModule("CarouselModule")}
            buttonLabel="Edit Carousel"
          />
        </Grid>

        {/* Second row: three small cards */}
        <Grid  >
          <SmallCard
            title="Contact Info"
            subtitle="Manage business contact information"
            icon={<CallIcon sx={{ color: "#ec4899" }} />}
            comingSoon={true}
          />
        </Grid>

        <Grid  >
          <SmallCard
            title="Testimonials"
            subtitle="Manage customer testimonials and reviews"
            icon={<PeopleIcon sx={{ color: "#7c3aed" }} />}
            comingSoon={true}
          />
        </Grid>

        <Grid  >
          <SmallCard
            title="About Us"
            subtitle="Create and manage about us section"
            icon={<InfoIcon sx={{ color: "#6b7280" }} />}
            comingSoon={true}
          />
        </Grid>

        {/* Footer section card */}
        <Grid>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <FooterIcon sx={{ fontSize: 32 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Footer
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 1, mb: 2 }}>
                Customize the footer section shown across all pages
              </Typography>
              <Box>
                <Button
                  variant="contained"
                  onClick={() => setSelectedModule && setSelectedModule("FooterModule")}
                  sx={{ textTransform: "none", borderRadius: 2 }}
                >
                  Edit Footer
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomeModule;
