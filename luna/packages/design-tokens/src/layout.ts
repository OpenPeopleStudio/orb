/**
 * Layout tokens for SomaForge
 * 
 * Philosophy: Consistent layout constants for structure.
 * Supports "control center" layout with nav rail, top bar, and workspace.
 */

import { radii } from "./radii";

export const layout = {
  maxWidth: {
    content: "1280px", // SOURCE: Content area max width - readable workspace
    narrow: "768px", // SOURCE: Narrow content - forms, details
  },
  
  navRail: {
    width: "240px", // SOURCE: Left nav rail - primary sections
    collapsedWidth: "64px", // SOURCE: Collapsed nav rail - icon-only
  },
  
  topBar: {
    height: "64px", // SOURCE: Top bar - context and environment
  },
  
  card: {
    radiusDefault: radii.m, // SOURCE: Default card radius - ties to radii.m
    padding: "1.5rem", // SOURCE: Card padding - comfortable spacing
  },
  
  panel: {
    width: "320px", // SOURCE: Right-hand side panel - details/logs
    minWidth: "280px", // SOURCE: Minimum panel width - responsive
  },
  
  workspace: {
    minHeight: "600px", // SOURCE: Minimum workspace height - usable area
  },
} as const;

