/**
 * Shadow tokens for SomaForge
 * 
 * Philosophy: Soft, layered shadows for depth.
 * Glows reference accent colors for intentional highlights.
 */

export const shadows = {
  surface: "0 1px 2px 0 rgba(0, 0, 0, 0.3)", // SOURCE: Subtle surface elevation
  elevated: "0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)", // SOURCE: Card elevation
  glow: {
    primary: "0 0 12px rgba(0, 212, 255, 0.3)", // SOURCE: Accent glow - controlled highlight
    secondary: "0 0 12px rgba(124, 58, 237, 0.3)", // SOURCE: Secondary accent glow
    subtle: "0 0 8px rgba(255, 255, 255, 0.1)", // SOURCE: Subtle glow - soft surfaces
  },
} as const;

