/**
 * SomaForge Design Tokens
 * 
 * Central export for all design tokens.
 * Provides a cohesive theme object for consumption in apps.
 */

export * from "./colors";
export * from "./typography";
export * from "./spacing";
export * from "./radii";
export * from "./shadows";
export * from "./motion";
export * from "./layout";

import { colors } from "./colors";
import { typography } from "./typography";
import { spacing } from "./spacing";
import { radii } from "./radii";
import { shadows } from "./shadows";
import { motion } from "./motion";
import { layout } from "./layout";

/**
 * Complete theme object aggregating all token sets.
 * Use this for comprehensive theme access in applications.
 */
export const theme = {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  motion,
  layout,
} as const;
