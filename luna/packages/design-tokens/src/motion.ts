/**
 * Motion tokens for SomaForge
 * 
 * Philosophy: Soft but intentional motion (no gimmicks).
 * Deliberate transitions that feel grounded and purposeful.
 * 
 * TODO: Align exact values with SomaForgeMotionTokenSet.md when available
 */

export const motion = {
  duration: {
    xs: "100ms", // SOURCE: Instant feedback - button presses
    s: "200ms", // SOURCE: Quick transitions - most UI changes
    m: "300ms", // SOURCE: Standard transitions - panel opens, cards
    l: "500ms", // SOURCE: Deliberate transitions - major state changes
  },
  
  easing: {
    orbital: "cubic-bezier(0.34, 1.56, 0.64, 1)", // SOURCE: Orbit-like movement - smooth but intentional
    softSnap: "cubic-bezier(0.4, 0, 0.2, 1)", // SOURCE: Button/press feel - natural deceleration
    smooth: "cubic-bezier(0.4, 0, 0.2, 1)", // SOURCE: Standard easing - most transitions
    easeOut: "cubic-bezier(0, 0, 0.2, 1)", // SOURCE: Exit animations
    easeIn: "cubic-bezier(0.4, 0, 1, 1)", // SOURCE: Entrance animations
  },
  
  scale: {
    press: 0.98, // SOURCE: Button press feedback - subtle but noticeable
    active: 0.95, // SOURCE: Active state - more pronounced
    hover: 1.02, // SOURCE: Hover state - slight lift
  },
} as const;

