/**
 * Border radius tokens for SomaForge
 * 
 * Philosophy: Soft but intentional curves.
 * Pill radius for chips and nav elements to match "control surface" vibe.
 */

export const radii = {
  none: "0",
  xs: "0.25rem", // 4px
  s: "0.375rem", // 6px
  m: "0.5rem", // 8px
  l: "0.75rem", // 12px
  pill: "9999px", // SOURCE: Control surface vibe - chips and nav elements
} as const;

