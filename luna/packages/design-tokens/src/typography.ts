/**
 * Typography tokens for SomaForge
 * 
 * Philosophy: Typography-first approach with clear hierarchy.
 * System fonts for performance and consistency.
 * 
 * TODO: Align exact values with SomaForgeBrandManual.md when available
 */

export const typography = {
  fontFamily: {
    systemSans: [
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "Oxygen",
      "Ubuntu",
      "Cantarell",
      "Fira Sans",
      "Droid Sans",
      "Helvetica Neue",
      "sans-serif",
    ].join(", "),
    mono: [
      "SF Mono",
      "Monaco",
      "Inconsolata",
      "Fira Code",
      "Fira Mono",
      "Droid Sans Mono",
      "Source Code Pro",
      "monospace",
    ].join(", "),
  },
  
  heading: {
    xl: {
      fontFamily: "var(--font-system-sans, system-ui)",
      fontSize: "2.5rem", // 40px
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
    },
    l: {
      fontFamily: "var(--font-system-sans, system-ui)",
      fontSize: "2rem", // 32px
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: "-0.01em",
    },
    m: {
      fontFamily: "var(--font-system-sans, system-ui)",
      fontSize: "1.5rem", // 24px
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
    },
    s: {
      fontFamily: "var(--font-system-sans, system-ui)",
      fontSize: "1.25rem", // 20px
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: "0",
    },
  },
  
  body: {
    l: {
      fontFamily: "var(--font-system-sans, system-ui)",
      fontSize: "1.125rem", // 18px
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: "0",
    },
    m: {
      fontFamily: "var(--font-system-sans, system-ui)",
      fontSize: "1rem", // 16px
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: "0",
    },
    s: {
      fontFamily: "var(--font-system-sans, system-ui)",
      fontSize: "0.875rem", // 14px
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: "0.01em",
    },
  },
  
  label: {
    fontFamily: "var(--font-system-sans, system-ui)",
    fontSize: "0.75rem", // 12px
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
  },
  
  code: {
    fontFamily: "var(--font-mono, monospace)",
    fontSize: "0.875rem", // 14px
    fontWeight: 400,
    lineHeight: 1.6,
    letterSpacing: "0",
  },
} as const;

