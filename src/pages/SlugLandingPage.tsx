// // src/pages/SlugLandingPage.tsx
// import React, { useState } from "react";
// import { 
//   Box, 
//   Typography, 
//   TextField, 
//   Button, 
//   Paper,
//   Card,
//   Grid,
//   InputAdornment,
//   Alert,
//   Fade,
//   Container
// } from "@mui/material";
// import { 
//   Link, 
//   AutoAwesome, 
//   ChevronRight,
//   Language,
//   CheckCircle,
//   ErrorOutline
// } from "@mui/icons-material";

// type Props = {
//   setSelectedModule: (moduleName: string) => void;
//   setAllowSkip: (v: boolean) => void;
// };

// const SlugLandingPage: React.FC<Props> = ({ setSelectedModule, setAllowSkip }) => {
//   const [title, setTitle] = useState("");
//   const [slug, setSlug] = useState("");
//   const [error, setError] = useState<string | null>(null);
//   const [isValid, setIsValid] = useState<boolean>(false);

//   function generateSlug(from: string) {
//     const s = from
//       .toLowerCase()
//       .replace(/[^a-z0-9\s-]/g, "")
//       .trim()
//       .replace(/\s+/g, "-");
//     setSlug(s);
//     validateSlug(s);
//     setError(null);
//   }

//   function validateSlug(s: string) {
//     if (!s) {
//       setIsValid(false);
//       return false;
//     }
//     const valid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
//     setIsValid(valid);
//     return valid;
//   }

//   function handleSlugChange(value: string) {
//     const lowerValue = value.toLowerCase();
//     setSlug(lowerValue);
//     validateSlug(lowerValue);
//     setError(null);
//   }

//   function saveBaseSlug() {
//     if (!slug || !validateSlug(slug)) {
//       setError("Please provide a valid slug (lowercase, letters/numbers, hyphens only).");
//       return;
//     }
//     localStorage.setItem("cms_base_slug", slug);
//     setAllowSkip(false);
//     setSelectedModule("home");
//   }

//   function skipForNow() {
//     setAllowSkip(true);
//     setSelectedModule("home");
//   }

//   const examples = [
//     "summer-collection-2024",
//     "product-launch-event",
//     "company-news-updates",
//     "winter-campaign-2024"
//   ];

//   return (
//     <Box sx={{ 
//       minHeight: "100vh", 
//       background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
//       display: "flex",
//       alignItems: "center",
//       py: 4
//     }}>
//       <Container maxWidth="lg">
//         <Fade in timeout={800}>
//           <Paper sx={{ 
//             p: { xs: 3, md: 6 }, 
//             maxWidth: 1000,
//             width: "100%",
//             mx: "auto",
//             background: "rgba(255, 255, 255, 0.95)",
//             backdropFilter: "blur(10px)",
//             borderRadius: 4,
//             boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)"
//           }}>
//             {/* Header Section */}
//             <Box sx={{ textAlign: "center", mb: 6 }}>
//               <Box sx={{ 
//                 display: "inline-flex", 
//                 alignItems: "center", 
//                 mb: 2,
//                 px: 3,
//                 py: 1,
//                 borderRadius: 3,
//                 backgroundColor: "primary.light",
//                 color: "primary.main"
//               }}>
//                 <Language sx={{ fontSize: 20, mr: 1 }} />
//                 <Typography variant="overline" fontWeight="bold">
//                   CMS SETUP
//                 </Typography>
//               </Box>
//               <Typography variant="h3" fontWeight="bold" gutterBottom>
//                 Welcome to Your CMS
//               </Typography>
//               <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
//                 Set your base URL slug to get started. This will be the foundation for all your content pages.
//               </Typography>
//             </Box>

//             <Grid container spacing={6}>
//               {/* Left Column - Input Section */}
//               <Grid>
//                 <Card sx={{ p: 4, height: "100%", borderRadius: 3 }}>
//                   <Typography variant="h5" fontWeight="600" gutterBottom>
//                     Configure Base Slug
//                   </Typography>
//                   <Typography color="text.secondary" sx={{ mb: 4 }}>
//                     Create a unique identifier for your content space
//                   </Typography>

//                   {/* Title Input */}
//                   <Box sx={{ mb: 3 }}>
//                     <TextField
//                       fullWidth
//                       label="Content Title"
//                       value={title}
//                       onChange={(e) => setTitle(e.target.value)}
//                       placeholder="e.g., Spring Sale Campaign 2024"
//                       helperText="Enter a descriptive title for reference"
//                       InputProps={{
//                         endAdornment: (
//                           <InputAdornment position="end">
//                             <Button 
//                               variant="outlined" 
//                               onClick={() => generateSlug(title)}
//                               disabled={!title.trim()}
//                               startIcon={<AutoAwesome />}
//                               size="small"
//                             >
//                               Generate
//                             </Button>
//                           </InputAdornment>
//                         )
//                       }}
//                     />
//                   </Box>

//                   {/* Slug Input */}
//                   <Box sx={{ mb: 2 }}>
//                     <TextField
//                       fullWidth
//                       label="Base Slug"
//                       value={slug}
//                       onChange={(e) => handleSlugChange(e.target.value)}
//                       placeholder="e.g., spring-sale-2024"
//                       error={!!error && slug.length > 0}
//                       InputProps={{
//                         startAdornment: (
//                           <InputAdornment position="start">
//                             <Link color="action" />
//                           </InputAdornment>
//                         ),
//                         endAdornment: (
//                           <InputAdornment position="end">
//                             {slug && (
//                               isValid ? (
//                                 <CheckCircle color="success" />
//                               ) : (
//                                 <ErrorOutline color="error" />
//                               )
//                             )}
//                           </InputAdornment>
//                         )
//                       }}
//                     />
//                   </Box>

//                   {/* Validation Status */}
//                   {slug && (
//                     <Alert 
//                       severity={isValid ? "success" : "error"} 
//                       sx={{ mb: 3, borderRadius: 2 }}
//                     >
//                       {isValid ? 
//                         "Perfect! This slug is available and valid." : 
//                         "Invalid format. Use only lowercase letters, numbers, and hyphens."
//                       }
//                     </Alert>
//                   )}

//                   {/* Action Buttons */}
//                   <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
//                     <Button 
//                       variant="contained" 
//                       onClick={saveBaseSlug}
//                       disabled={!slug || !isValid}
//                       endIcon={<ChevronRight />}
//                       size="large"
//                       sx={{ 
//                         flex: 1,
//                         minWidth: 200,
//                         py: 1.5
//                       }}
//                     >
//                       Continue to Dashboard
//                     </Button>
//                     <Button 
//                       variant="outlined" 
//                       onClick={skipForNow}
//                       size="large"
//                       sx={{ py: 1.5 }}
//                     >
//                       Skip for Now
//                     </Button>
//                   </Box>
//                 </Card>
//               </Grid>

//               {/* Right Column - Examples & Info */}
//               <Grid>
//                 <Box sx={{ height: "100%" }}>
//                   {/* Examples Card */}
//                   <Card sx={{ p: 4, mb: 4, borderRadius: 3 }}>
//                     <Typography variant="h6" fontWeight="600" gutterBottom>
//                       Good Slug Examples
//                     </Typography>
//                     <Typography color="text.secondary" sx={{ mb: 3 }}>
//                       These examples follow the best practices for URL slugs:
//                     </Typography>
//                     <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//                       {examples.map((example, index) => (
//                         <Box
//                           key={index}
//                           sx={{ 
//                             display: "flex", 
//                             alignItems: "center", 
//                             p: 2, 
//                             borderRadius: 2,
//                             backgroundColor: "grey.50",
//                             border: "1px solid",
//                             borderColor: "grey.200"
//                           }}
//                         >
//                           <CheckCircle color="success" sx={{ mr: 2, fontSize: 20 }} />
//                           <Typography variant="body2" fontFamily="monospace">
//                             {example}
//                           </Typography>
//                         </Box>
//                       ))}
//                     </Box>
//                   </Card>

//                   {/* Info Card */}
//                   <Card sx={{ p: 4, borderRadius: 3, backgroundColor: "primary.50" }}>
//                     <Typography variant="h6" fontWeight="600" gutterBottom color="primary.main">
//                       Why Set a Base Slug?
//                     </Typography>
//                     <Typography variant="body2" color="primary.dark" sx={{ mb: 2 }}>
//                       Your base slug creates a dedicated namespace for your content, making it:
//                     </Typography>
//                     <Box component="ul" sx={{ pl: 2, color: "primary.dark" }}>
//                       <Typography component="li" variant="body2">
//                         Easy to organize and manage
//                       </Typography>
//                       <Typography component="li" variant="body2">
//                         SEO-friendly and readable
//                       </Typography>
//                       <Typography component="li" variant="body2">
//                         Simple to share and remember
//                       </Typography>
//                     </Box>
//                   </Card>
//                 </Box>
//               </Grid>
//             </Grid>

//             {/* Footer Note */}
//             <Box sx={{ textAlign: "center", mt: 6, pt: 4, borderTop: "1px solid", borderColor: "grey.200" }}>
//               <Typography variant="body2" color="text.secondary">
//                 You can always change this later in your dashboard settings
//               </Typography>
//             </Box>
//           </Paper>
//         </Fade>
//       </Container>
//     </Box>
//   );
// };

// export default SlugLandingPage;
export {};