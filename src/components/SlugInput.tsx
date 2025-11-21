// src/components/SlugInput.tsx
import React, { useEffect, useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";

type Props = {
  moduleKey: string;
  moduleLabel?: string;
  storageKey?: string;
  onChange?: (value: string) => void;
};

/**
 * SlugInput:
 * - Reads base slug from localStorage 'cms_base_slug'
 * - Shows a disabled default path like `${baseSlug}/component-name` (gray) when not editing
 * - "Use custom path" toggles editing
 * - Saves chosen slug to localStorage under the provided storageKey (if any) when user clicks Save
 */
export default function SlugInput({
  moduleKey,
  moduleLabel,
  storageKey,
  onChange,
}: Props) {
  const [baseSlug, setBaseSlug] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [editing, setEditing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = localStorage.getItem("cms_base_slug") || "";
    setBaseSlug(s);
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setValue(saved);
      } else {
        setValue(s ? `${s}/component-name` : "");
      }
    } else {
      setValue(s ? `${s}/component-name` : "");
    }
  }, [storageKey]);

  function validateSlugCandidate(v: string) {
    if (v.trim() === "/") return true;
    return /^[a-zA-Z0-9-./:]+$/.test(v.trim());
  }

  function handleSave() {
    if (!validateSlugCandidate(value)) {
      setError("Invalid characters in slug. Use letters, numbers, hyphens, dots or '/' for root.");
      return;
    }
    setError(null);
    if (storageKey) {
      localStorage.setItem(storageKey, value.trim());
    }
    if (onChange) onChange(value.trim());
    setEditing(false);
  }

  const displayValue = (() => {
    if (!baseSlug) return value || "";
    if ((value || "").startsWith("http") || (value || "").includes(".")) return value;
    if ((value || "").trim() === "/") return `${baseSlug}/`;
    if (!value || value === `${baseSlug}/component-name`) return `${baseSlug}/component-name`;
    if ((value || "").startsWith(baseSlug)) return value;
    return `${baseSlug}/${value}`;
  })();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {moduleLabel || moduleKey} — Path
        </Typography>

        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
          {baseSlug ? `Base: ${baseSlug}` : "No base slug set"}
        </Typography>
      </Box>

      {!editing ? (
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            value={displayValue}
            size="small"
            fullWidth
            InputProps={{ readOnly: true }}
            sx={{ backgroundColor: "#f5f6f7" }}
          />
          <Button variant="outlined" onClick={() => setEditing(true)}>
            Use custom path
          </Button>
          <Button
            variant="text"
            color="inherit"
            onClick={() => {
              const val = baseSlug ? `${baseSlug}/component-name` : "";
              setValue(val);
              if (storageKey) localStorage.setItem(storageKey, val);
              if (onChange) onChange(val);
            }}
          >
            Use default
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            value={value}
            size="small"
            fullWidth
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            helperText={error || "Use '/' for root (base), or enter a path (e.g. products/hero-banner)"}
          />
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
          <Button variant="text" onClick={() => { setEditing(false); setError(null); }}>
            Cancel
          </Button>
        </Box>
      )}
    </Box>
  );
}
