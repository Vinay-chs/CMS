// src/pages/LandingPage.tsx
import React from "react";
import { Box, Typography, Button, Container, Paper, Stack, Chip } from "@mui/material";
import { PageProps } from "../types/routes";
import { useNavigate } from "react-router-dom";
import NavbarRenderer from "../components/NavbarRenderer";

const LandingPage: React.FC<PageProps> = ({ setSelectedModule }) => {
  const demoNavbarConfig = {
    siteId: "landing-page",
    components: [
      {
        id: "logo",
        type: "logo" as const,
        position: "left" as const,
        sequence: 1,
        config: { src: "", alt: "CMS Builder" }
      },
      {
        id: "title",
        type: "title" as const,
        position: "center" as const,
        sequence: 1,
        config: { text: "CMS Builder", link: "/" }
      },
      {
        id: "cta",
        type: "ctaButton" as const,
        position: "right" as const,
        sequence: 1,
        config: { text: "Get Started", url: "#start" }
      }
    ],
    color: "#1976d2",
    theme: "light" as const,
    version: 1,
    published: false
  };

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      {/* Demo Navbar */}
      <Box sx={{ bgcolor: "#1976d2", mb: 0 }}>
        <NavbarRenderer config={demoNavbarConfig} />
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Paper elevation={10} sx={{ p: { xs: 3, md: 6 }, borderRadius: 4, textAlign: "center" }}>
          <Typography variant="h2" fontWeight="bold" color="primary" gutterBottom>
            🚀 CMS Builder
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
            Create, Manage & Export Components with Ease
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: "1.1rem" }}>
            <strong>What is a Slug?</strong> A slug is a user-friendly identifier for your components. 
            Instead of remembering complex IDs like "nav-123-xyz", use simple names like "main-header-nav" 
            that automatically become part of your URLs.
          </Typography>

          <Box sx={{ bgcolor: "#f5f5f5", p: 4, borderRadius: 3, mb: 4, textAlign: "left" }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              🎯 <strong>How Slugs Work:</strong>
            </Typography>
            <Stack spacing={1} sx={{ mt: 2 }}>
              <Chip label="Create navbar → Set slug as 'main-menu'" variant="outlined" />
              <Chip label="Access it via: yoursite.com/components/main-menu" variant="outlined" />
              <Chip label="Share easily: 'Check our main-menu component!'" variant="outlined" />
              <Chip label="SEO friendly URLs automatically" variant="outlined" />
            </Stack>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              size="large" 
              onClick={() => setSelectedModule?.("home")}
              sx={{ 
                px: 4, 
                py: 1.5, 
                fontSize: "1.1rem",
                borderRadius: 3
              }}
            >
              Get Started Building ›
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              onClick={() => setSelectedModule?.("home")}
              sx={{ 
                px: 4, 
                py: 1.5, 
                fontSize: "1.1rem",
                borderRadius: 3
              }}
            >
              View Components
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LandingPage;