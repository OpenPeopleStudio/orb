/**
 * Color tokens for SomaForge
 * 
 * Philosophy: Dark, focused base surfaces with high-contrast but controlled accents.
 * 40% aerospace (precision, grid, monochrome)
 * 30% EV product (smooth surfaces, clarity)
 * 30% human-centric device (emotional restraint, typography-first)
 * 
 * TODO: Align exact values with SomaForgeVisualStyleTokens.md when available
 */

export const colors = {
  background: {
    base: "#0a0a0f", // SOURCE: Dark focused base - aerospace monochrome foundation
    surface: "#121218", // SOURCE: Elevated surface - subtle depth
    elevated: "#1a1a22", // SOURCE: Higher elevation - card surfaces
  },
  
  accent: {
    primary: "#00d4ff", // SOURCE: Neon-like accent - EV product clarity
    secondary: "#7c3aed", // SOURCE: Controlled accent - human-centric restraint
    warning: "#f59e0b", // SOURCE: Warning state - intentional but not alarming
    success: "#10b981", // SOURCE: Success state - calm confirmation
    error: "#ef4444", // SOURCE: Error state - clear but controlled
  },
  
  text: {
    primary: "#ffffff", // SOURCE: High contrast - typography-first
    secondary: "#d1d5db", // SOURCE: Secondary text - readable but subdued
    muted: "#9ca3af", // SOURCE: Muted text - hierarchy support
    inverse: "#0a0a0f", // SOURCE: Inverse text for light surfaces
  },
  
  border: {
    subtle: "rgba(255, 255, 255, 0.08)", // SOURCE: Subtle separation - precision grid
    strong: "rgba(255, 255, 255, 0.16)", // SOURCE: Strong separation - clear boundaries
    accent: "rgba(0, 212, 255, 0.3)", // SOURCE: Accent borders - controlled highlight
  },
} as const;

