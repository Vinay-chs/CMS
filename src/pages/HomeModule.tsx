// src/pages/HomeModule.tsx
import React from "react";
import { Box, Typography, Paper, Grid, Card, CardContent, Button } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { PageProps } from "../types/routes";

const HomeModule: React.FC<PageProps> = ({ setSelectedModule }) => (
  <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh", backgroundColor: "#f5f7f8" }}>
    <Paper elevation={2} sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, maxWidth: 1200, mx: "auto" }}>
      <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 3 }}>
        <HomeIcon sx={{ fontSize: 44, color: "#2c3e50" }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#2c3e50" }}>
            Welcome to CMS Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: "#61717a", mt: 1 }}>
            Build and customize your website components
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* NavBuilder Card - ACTIVE */}
        <Grid  >
          <Card
            sx={{
              height: "100%",
              cursor: "pointer",
              transition: "all 0.3s",
              "&:hover": { transform: "translateY(-4px)", boxShadow: 4 },
            }}
            onClick={() => setSelectedModule && setSelectedModule("navbar")}
          >
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2, color: "#2c3e50" }}>
                📊 NavBuilder
              </Typography>
              <Typography variant="body2" sx={{ color: "#61717a" }}>
                Create and customize your website navigation bar with components
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Carousels Card - NOW ACTIVE */}
        <Grid  >
          <Card
            sx={{
              height: "100%",
              cursor: "pointer",
              transition: "all 0.3s",
              "&:hover": { transform: "translateY(-4px)", boxShadow: 4 },
            }}
            onClick={() => setSelectedModule && setSelectedModule("carousel")}
          >
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2, color: "#2c3e50" }}>
                🎠 Carousels
              </Typography>
              <Typography variant="body2" sx={{ color: "#61717a", mb: 2 }}>
                Design beautiful image and content sliders
              </Typography>
            
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Info Card - Coming Soon */}
        <Grid  >
          <Card sx={{ height: "100%", transition: "all 0.3s", opacity: 0.7 }}>
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2, color: "#2c3e50" }}>
                📞 Contact Info
              </Typography>
              <Typography variant="body2" sx={{ color: "#61717a", mb: 2 }}>
                Manage business contact information
              </Typography>
              <Button variant="outlined" disabled sx={{ mt: 1 }}>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Testimonials (kept as Coming Soon) */}
        <Grid  >
          <Card sx={{ height: "100%", transition: "all 0.3s", opacity: 0.7 }}>
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2, color: "#2c3e50" }}>
                💬 Testimonials
              </Typography>
              <Typography variant="body2" sx={{ color: "#61717a", mb: 2 }}>
                Manage customer testimonials and reviews
              </Typography>
              <Button variant="outlined" disabled sx={{ mt: 1 }}>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* About Us */}
        <Grid  >
          <Card sx={{ height: "100%", transition: "all 0.3s", opacity: 0.7 }}>
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2, color: "#2c3e50" }}>
                👥 About Us
              </Typography>
              <Typography variant="body2" sx={{ color: "#61717a", mb: 2 }}>
                Create and manage about us section
              </Typography>
              <Button variant="outlined" disabled sx={{ mt: 1 }}>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Footer */}
        <Grid  >
          <Card sx={{ height: "100%", transition: "all 0.3s", opacity: 0.7 }}>
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2, color: "#2c3e50" }}>
                🔻 Footer
              </Typography>
              <Typography variant="body2" sx={{ color: "#61717a", mb: 2 }}>
                Customize website footer section
              </Typography>
              <Button variant="outlined" disabled sx={{ mt: 1 }}>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="body1" sx={{ color: "#61717a", mb: 3 }}>
          Click on NavBuilder to start creating your website navigation.
        </Typography>

        <Button
          variant="contained"
          onClick={() => setSelectedModule && setSelectedModule("navbar")}
          sx={{
            textTransform: "none",
            borderRadius: 2,
            px: 4,
            py: 1.5,
            fontSize: "1.1rem",
          }}
        >
          Start with NavBuilder
        </Button>
      </Box>
    </Paper>
  </Box>
);

export default HomeModule;
