"use client";

import { usePipelines } from "@soma-forge/forge-core";
import { colors, spacing, radii, shadows, typography } from "@/lib/tokens";
import Link from "next/link";

export default function PipelinesList() {
  const pipelines = usePipelines();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return colors.accent.success;
      case "paused":
        return colors.accent.warning;
      case "draft":
        return colors.text.muted;
      default:
        return colors.text.secondary;
    }
  };

  const getRunStatusColor = (status?: string) => {
    if (!status) return colors.text.muted;
    switch (status) {
      case "completed":
        return colors.accent.success;
      case "running":
        return colors.accent.primary;
      case "failed":
        return colors.accent.error;
      default:
        return colors.text.secondary;
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: spacing.l,
      }}
    >
      {pipelines.length === 0 ? (
        <div
          style={{
            gridColumn: "1 / -1",
            padding: spacing.xl,
            color: colors.text.muted,
            ...typography.body.m,
            textAlign: "center",
          }}
        >
          No pipelines found
        </div>
      ) : (
        pipelines.map((pipeline) => (
          <Link
            key={pipeline.id}
            href={`/pipelines/${pipeline.id}`}
            style={{
              backgroundColor: colors.background.elevated,
              borderRadius: radii.m,
              padding: spacing.l,
              boxShadow: shadows.elevated,
              border: `1px solid ${colors.border.subtle}`,
              textDecoration: "none",
              color: colors.text.primary,
              transition: `all 200ms`,
              display: "flex",
              flexDirection: "column",
              gap: spacing.m,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.border.accent;
              e.currentTarget.style.transform = `translateY(-2px)`;
              e.currentTarget.style.boxShadow = shadows.glow.subtle;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.border.subtle;
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = shadows.elevated;
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3
                style={{
                  ...typography.heading.s,
                  color: colors.text.primary,
                  margin: 0,
                }}
              >
                {pipeline.name}
              </h3>
              <span
                style={{
                  display: "inline-block",
                  padding: `${spacing.xxs} ${spacing.s}`,
                  borderRadius: radii.pill,
                  backgroundColor: `${getStatusColor(pipeline.status)}20`,
                  color: getStatusColor(pipeline.status),
                  ...typography.body.s,
                  textTransform: "capitalize",
                  fontSize: "0.75rem",
                }}
              >
                {pipeline.status}
              </span>
            </div>
            {pipeline.description && (
              <p
                style={{
                  ...typography.body.s,
                  color: colors.text.secondary,
                  margin: 0,
                }}
              >
                {pipeline.description}
              </p>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: spacing.m, marginTop: "auto" }}>
              <span
                style={{
                  ...typography.body.s,
                  color: colors.text.muted,
                }}
              >
                {pipeline.steps.length} step{pipeline.steps.length !== 1 ? "s" : ""}
              </span>
              {pipeline.lastRunStatus && (
                <>
                  <span style={{ color: colors.text.muted }}>•</span>
                  <span
                    style={{
                      ...typography.body.s,
                      color: getRunStatusColor(pipeline.lastRunStatus),
                      textTransform: "capitalize",
                    }}
                  >
                    {pipeline.lastRunStatus}
                  </span>
                </>
              )}
            </div>
          </Link>
        ))
      )}
    </div>
  );
}

