"use client";

import { colors, spacing, radii, shadows, typography } from "@/lib/tokens";

export default function SettingsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing.xl }}>
      {/* General Section */}
      <div
        style={{
          backgroundColor: colors.background.elevated,
          borderRadius: radii.m,
          padding: spacing.xl,
          boxShadow: shadows.elevated,
          border: `1px solid ${colors.border.subtle}`,
        }}
      >
        <h2
          style={{
            ...typography.heading.s,
            color: colors.text.primary,
            marginBottom: spacing.l,
          }}
        >
          General
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: spacing.l }}>
          <div>
            <label
              style={{
                ...typography.label,
                color: colors.text.muted,
                marginBottom: spacing.xs,
                display: "block",
              }}
            >
              Forge Name
            </label>
            <input
              type="text"
              value="SomaForge"
              readOnly
              style={{
                width: "100%",
                maxWidth: "400px",
                padding: spacing.m,
                borderRadius: radii.m,
                backgroundColor: colors.background.surface,
                border: `1px solid ${colors.border.subtle}`,
                color: colors.text.primary,
                ...typography.body.m,
                fontFamily: typography.fontFamily.systemSans,
              }}
            />
          </div>
          <div>
            <label
              style={{
                ...typography.label,
                color: colors.text.muted,
                marginBottom: spacing.xs,
                display: "block",
              }}
            >
              Environment
            </label>
            <div
              style={{
                display: "inline-block",
                padding: `${spacing.xs} ${spacing.m}`,
                borderRadius: radii.pill,
                backgroundColor: colors.background.surface,
                border: `1px solid ${colors.border.subtle}`,
                ...typography.body.m,
                color: colors.text.secondary,
              }}
            >
              development
            </div>
          </div>
        </div>
      </div>

      {/* Integrations Section */}
      <div
        style={{
          backgroundColor: colors.background.elevated,
          borderRadius: radii.m,
          padding: spacing.xl,
          boxShadow: shadows.elevated,
          border: `1px solid ${colors.border.subtle}`,
        }}
      >
        <h2
          style={{
            ...typography.heading.s,
            color: colors.text.primary,
            marginBottom: spacing.l,
          }}
        >
          Integrations
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: spacing.l }}>
          <div>
            <label
              style={{
                ...typography.label,
                color: colors.text.muted,
                marginBottom: spacing.xs,
                display: "block",
              }}
            >
              Git Repository URL
            </label>
            <div
              style={{
                padding: spacing.m,
                borderRadius: radii.m,
                backgroundColor: colors.background.surface,
                border: `1px solid ${colors.border.subtle}`,
                color: colors.text.muted,
                ...typography.body.m,
                fontStyle: "italic",
              }}
            >
              Placeholder for Git repository URL
            </div>
          </div>
          <div>
            <label
              style={{
                ...typography.label,
                color: colors.text.muted,
                marginBottom: spacing.xs,
                display: "block",
              }}
            >
              Luna Node Status
            </label>
            <div
              style={{
                padding: spacing.m,
                borderRadius: radii.m,
                backgroundColor: colors.background.surface,
                border: `1px solid ${colors.border.subtle}`,
                color: colors.text.muted,
                ...typography.body.m,
                fontStyle: "italic",
              }}
            >
              Placeholder text for Luna node status
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

