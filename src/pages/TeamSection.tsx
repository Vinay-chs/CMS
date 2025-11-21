// src/pages/TeamSection.tsx
import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  Grid,
  IconButton,
  Stack,
  Button,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemButton,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,

} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import SaveIcon from "@mui/icons-material/Save";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";
import FacebookIcon from "@mui/icons-material/FacebookRounded";
import InstagramIcon from "@mui/icons-material/Instagram";
import MailOutlineIcon from "@mui/icons-material/MailOutline";

export type TeamMember = {
  id: string;
  name: string;
  role?: string;
  bio?: string;
  avatarUrl?: string;
  email?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
};

const sampleMembers: TeamMember[] = [
  {
    id: "m1",
    name: "Asha Reddy",
    role: "Head of Product",
    bio: "Product leader focused on healthcare UX and growth.",
    avatarUrl: "https://i.pravatar.cc/300?img=32",
    email: "asha@company.com",
    linkedin: "https://linkedin.com/in/asha",
  },
  {
    id: "m2",
    name: "Karthik Sharma",
    role: "Lead Engineer",
    bio: "Builds resilient systems and loves clean code.",
    avatarUrl: "https://i.pravatar.cc/300?img=12",
    email: "karthik@company.com",
    twitter: "https://twitter.com/karthik",
  },
  {
    id: "m3",
    name: "Priya Singh",
    role: "Design Manager",
    bio: "Designs delightful and accessible interfaces.",
    avatarUrl: "https://i.pravatar.cc/300?img=48",
    instagram: "https://instagram.com/priya",
  },
];

function uid() {
  return `m-${Math.random().toString(36).substr(2, 9)}`;
}

const SocialIcons = ({ member }: { member: TeamMember }) => (
  <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mt: 2 }}>
    {member.email && (
      <IconButton href={`mailto:${member.email}`} size="small">
        <MailOutlineIcon fontSize="small" />
      </IconButton>
    )}
    {member.linkedin && (
      <IconButton href={member.linkedin} target="_blank" size="small">
        <LinkedInIcon fontSize="small" />
      </IconButton>
    )}
    {member.twitter && (
      <IconButton href={member.twitter} target="_blank" size="small">
        <TwitterIcon fontSize="small" />
      </IconButton>
    )}
    {member.facebook && (
      <IconButton href={member.facebook} target="_blank" size="small">
        <FacebookIcon fontSize="small" />
      </IconButton>
    )}
    {member.instagram && (
      <IconButton href={member.instagram} target="_blank" size="small">
        <InstagramIcon fontSize="small" />
      </IconButton>
    )}
  </Stack>
);

const TeamSection: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>(sampleMembers.map(m => ({ ...m })));
  const [sectionTitle, setSectionTitle] = useState("Our Amazing Team");
  const [sectionSubtitle, setSectionSubtitle] = useState("We are a group of innovative, experienced, and proficient team. You will love to work with us.");
  const [selectedStyle, setSelectedStyle] = useState("style1");
  const [selectedId, setSelectedId] = useState<string | null>(members[0]?.id || null);
  const [editFields, setEditFields] = useState<TeamMember | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");

  const selected = useMemo(() => members.find(m => m.id === selectedId), [members, selectedId]);

  useEffect(() => {
    setEditFields(selected ? { ...selected } : null);
  }, [selected]);

  const addMember = () => {
    const newMember: TeamMember = {
      id: uid(),
      name: "New Member",
      role: "Role",
      bio: "Short bio...",
      avatarUrl: `https://i.pravatar.cc/300?img=${Math.floor(Math.random() * 70)}`,
    };
    setMembers(prev => [...prev, newMember]);
    setSelectedId(newMember.id);
  };

  const removeMember = (id: string) => {
    if (!window.confirm("Delete this member?")) return;
    setMembers(prev => prev.filter(m => m.id !== id));
    if (selectedId === id) setSelectedId(members.find(m => m.id !== id)?.id || null);
  };

  const applyEdit = () => {
    if (!editFields || !editFields.name.trim()) {
      alert("Name is required!");
      return;
    }
    setMembers(prev => prev.map(m => (m.id === editFields.id ? editFields : m)));
  };

  const exportJSON = () => {
    const data = { sectionTitle, sectionSubtitle, selectedStyle, members };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "team-section.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = () => {
    try {
      const parsed = JSON.parse(importText);
      if (parsed.sectionTitle) setSectionTitle(parsed.sectionTitle);
      if (parsed.sectionSubtitle) setSectionSubtitle(parsed.sectionSubtitle);
      if (parsed.selectedStyle) setSelectedStyle(parsed.selectedStyle);
      if (Array.isArray(parsed.members)) {
        const normalized = parsed.members.map((m: any) => ({ ...m, id: m.id || uid() }));
        setMembers(normalized);
        setSelectedId(normalized[0]?.id || null);
      }
      setImportOpen(false);
      setImportText("");
    } catch (e) {
      alert("Invalid JSON!");
    }
  };

  // Card Styles
  const CircularCard = ({ m }: { m: TeamMember }) => (
    <Box sx={{ textAlign: "center", p: 3 }}>
      <Avatar src={m.avatarUrl} sx={{ width: 140, height: 140, mx: "auto", mb: 2 }} />
      <Typography variant="h6" fontWeight={700}>{m.name}</Typography>
      <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>{m.role}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{m.bio}</Typography>
      <SocialIcons member={m} />
    </Box>
  );

  const LeftAlignedCard = ({ m }: { m: TeamMember }) => (
    <Card sx={{ display: "flex", p: 3, height: "100%" }}>
      <Avatar src={m.avatarUrl} sx={{ width: 100, height: 100, mr: 3 }} />
      <Box>
        <Typography variant="h6" fontWeight={700}>{m.name}</Typography>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>{m.role}</Typography>
        <Typography variant="body2" color="text.secondary">{m.bio}</Typography>
        <SocialIcons member={m} />
      </Box>
    </Card>
  );

  // Render different styles
  const renderPreview = () => {
    if (members.length === 0) return <Typography textAlign="center" color="text.secondary">Add members to see preview</Typography>;

    switch (selectedStyle) {
      case "style1":
        return (
          <Box sx={{ bgcolor: "#e3f2fd", py: 10, textAlign: "center" }}>
            <Typography variant="h3" fontWeight={800} gutterBottom>{sectionTitle}</Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: "auto", mb: 6 }}>{sectionSubtitle}</Typography>
            <Grid container spacing={4} justifyContent="center">
              {members.map(m => (
                <Grid  key={m.id}>
                  <Card sx={{ borderRadius: 4, boxShadow: 6 }}><CircularCard m={m} /></Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case "style2":
        return (
          <Box sx={{ bgcolor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", py: 10, color: "white", textAlign: "center" }}>
            <Typography variant="h3" fontWeight={800} gutterBottom>{sectionTitle}</Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 6 }}>{sectionSubtitle}</Typography>
            <Grid container spacing={4} justifyContent="center">
              {members.map(m => (
                <Grid key={m.id}>
                  <Box sx={{ bgcolor: "rgba(255,255,255,0.1)", borderRadius: 4, p: 3 }}>
                    <CircularCard m={m} />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case "style3":
        return (
          <Box sx={{ py: 8 }}>
            <Typography variant="h4" textAlign="center" fontWeight={800} gutterBottom>{sectionTitle}</Typography>
            <Typography textAlign="center" color="text.secondary" sx={{ mb: 6 }}>{sectionSubtitle}</Typography>
            <Stack direction="row" spacing={4} sx={{ overflowX: "auto", pb: 2 }}>
              {members.map(m => (
                <Box key={m.id} sx={{ minWidth: 300 }}><CircularCard m={m} /></Box>
              ))}
            </Stack>
          </Box>
        );

      case "style4":
        return (
          <Box sx={{ bgcolor: "#fff8e1", py: 10 }}>
            <Typography variant="h4" textAlign="center" fontWeight={800} gutterBottom>{sectionTitle}</Typography>
            <Typography textAlign="center" color="text.secondary" sx={{ mb: 6 }}>{sectionSubtitle}</Typography>
            <Grid container spacing={4}>
              {members.map(m => (
                <Grid key={m.id}>
                  <LeftAlignedCard m={m} />
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight={800} mb={2}>Team Section Builder (CMS)</Typography>

      <Grid container spacing={4}>
        {/* Left Panel */}
        <Grid>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <TextField label="Section Title" fullWidth value={sectionTitle} onChange={e => setSectionTitle(e.target.value)} sx={{ mb: 2 }} />
              <TextField label="Subtitle" fullWidth multiline rows={2} value={sectionSubtitle} onChange={e => setSectionSubtitle(e.target.value)} sx={{ mb: 3 }} />
              <FormControl fullWidth>
                <InputLabel>Style</InputLabel>
                <Select value={selectedStyle} onChange={e => setSelectedStyle(e.target.value)}>
                  <MenuItem value="style1">Modern Blue Grid</MenuItem>
                  <MenuItem value="style2">Gradient Purple</MenuItem>
                  <MenuItem value="style3">Horizontal Scroll</MenuItem>
                  <MenuItem value="style4">Left-Aligned Cards</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2} flexWrap="wrap" mb={2}>
                <Button variant="contained" startIcon={<AddIcon />} onClick={addMember}>Add Member</Button>
                <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={exportJSON}>Export</Button>
                <Button variant="outlined" startIcon={<FileUploadIcon />} onClick={() => setImportOpen(true)}>Import</Button>
              </Stack>

              <List>
                {members.map(m => (
                  <ListItem key={m.id} disablePadding secondaryAction={
                    <>
                      <IconButton onClick={() => setSelectedId(m.id)}><EditIcon /></IconButton>
                      <IconButton onClick={() => removeMember(m.id)}><DeleteIcon /></IconButton>
                    </>
                  }>
                    <ListItemButton selected={selectedId === m.id} onClick={() => setSelectedId(m.id)}>
                      <ListItemAvatar><Avatar src={m.avatarUrl} /></ListItemAvatar>
                      <ListItemText primary={m.name} secondary={m.role} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {editFields && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Edit Member</Typography>
                <TextField label="Name" fullWidth size="small" value={editFields.name} onChange={e => setEditFields({ ...editFields, name: e.target.value })} sx={{ mb: 2 }} />
                <TextField label="Role" fullWidth size="small" value={editFields.role || ""} onChange={e => setEditFields({ ...editFields, role: e.target.value })} sx={{ mb: 2 }} />
                <TextField label="Bio" fullWidth multiline rows={3} value={editFields.bio || ""} onChange={e => setEditFields({ ...editFields, bio: e.target.value })} sx={{ mb: 2 }} />
                <TextField label="Avatar URL" fullWidth size="small" value={editFields.avatarUrl || ""} onChange={e => setEditFields({ ...editFields, avatarUrl: e.target.value })} sx={{ mb: 2 }} />
                <TextField label="Email" fullWidth size="small" value={editFields.email || ""} onChange={e => setEditFields({ ...editFields, email: e.target.value })} sx={{ mb: 2 }} />
                <TextField label="LinkedIn" fullWidth size="small" value={editFields.linkedin || ""} onChange={e => setEditFields({ ...editFields, linkedin: e.target.value })} sx={{ mb: 2 }} />
                <Stack spacing={2} direction="row">
                  <Button variant="contained" startIcon={<SaveIcon />} onClick={applyEdit}>Save</Button>
                  <Button variant="outlined" onClick={() => setEditFields(selected ? { ...selected } : null)}>Cancel</Button>
                </Stack>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right Panel - Preview */}
        <Grid>
          <Typography variant="h5" gutterBottom>Live Preview</Typography>
          <Box sx={{ border: "2px dashed #ccc", borderRadius: 3, p: 4, minHeight: 600, bgcolor: "#fafafa" }}>
            {renderPreview()}
          </Box>
        </Grid>
      </Grid>

      <Dialog open={importOpen} onClose={() => setImportOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Import JSON</DialogTitle>
        <DialogContent>
          <TextField multiline rows={15} fullWidth value={importText} onChange={e => setImportText(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={doImport}>Import</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeamSection;