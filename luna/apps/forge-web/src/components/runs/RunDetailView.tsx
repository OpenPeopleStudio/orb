"use client";

import { useRun, usePipelines } from "@soma-forge/forge-core";
import { colors, spacing, radii, shadows, typography } from "@/lib/tokens";

interface RunDetailViewProps {
  runId: string;
}

export default function RunDetailView({ runId }: RunDetailViewProps) {
  const run = useRun(runId);
  const pipelines = usePipelines();

  if (!run) {
    return (
      <div
        style={{
          padding: spacing.xl,
          color: colors.text.muted,
          ...typography.body.m,
        }}
      >
        Run not found
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return colors.accent.success;
      case "running":
        return colors.accent.primary;
      case "failed":
        return colors.accent.error;
      case "cancelled":
        return colors.text.muted;
      default:
        return colors.text.secondary;
    }
  };

  const getPipelineName = (pipelineId: string) => {
    const pipeline = pipelines.find((p) => p.id === pipelineId);
    return pipeline?.name || pipelineId;
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return "—";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing.xl }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: colors.background.elevated,
          borderRadius: radii.m,
          padding: spacing.xl,
          boxShadow: shadows.elevated,
          border: `1px solid ${colors.border.subtle}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: spacing.m, marginBottom: spacing.m }}>
          <h1
            style={{
              ...typography.heading.l,
              color: colors.text.primary,
              margin: 0,
              fontFamily: typography.fontFamily.mono,
            }}
          >
            {run.id}
          </h1>
          <span
            style={{
              display: "inline-block",
              padding: `${spacing.xs} ${spacing.m}`,
              borderRadius: radii.pill,
              backgroundColor: `${getStatusColor(run.status)}20`,
              color: getStatusColor(run.status),
              ...typography.body.s,
              textTransform: "capitalize",
            }}
          >
            {run.status}
          </span>
        </div>
        <div
          style={{
            ...typography.body.m,
            color: colors.text.secondary,
          }}
        >
          Pipeline: {getPipelineName(run.pipelineId)}
        </div>
      </div>

      {/* Summary */}
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
            marginBottom: spacing.m,
          }}
        >
          Summary
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: spacing.m,
          }}
        >
          <div>
            <div
              style={{
                ...typography.label,
                color: colors.text.muted,
                marginBottom: spacing.xs,
              }}
            >
              Trigger
            </div>
            <div
              style={{
                ...typography.body.m,
                color: colors.text.primary,
                textTransform: "capitalize",
              }}
            >
              {run.trigger}
            </div>
          </div>
          <div>
            <div
              style={{
                ...typography.label,
                color: colors.text.muted,
                marginBottom: spacing.xs,
              }}
            >
              Started
            </div>
            <div
              style={{
                ...typography.body.m,
                color: colors.text.primary,
              }}
            >
              {new Date(run.startedAt).toLocaleString()}
            </div>
          </div>
          {run.completedAt && (
            <div>
              <div
                style={{
                  ...typography.label,
                  color: colors.text.muted,
                  marginBottom: spacing.xs,
                }}
              >
                Completed
              </div>
              <div
                style={{
                  ...typography.body.m,
                  color: colors.text.primary,
                }}
              >
                {new Date(run.completedAt).toLocaleString()}
              </div>
            </div>
          )}
          <div>
            <div
              style={{
                ...typography.label,
                color: colors.text.muted,
                marginBottom: spacing.xs,
              }}
            >
              Duration
            </div>
            <div
              style={{
                ...typography.body.m,
                color: colors.text.primary,
                fontFamily: typography.fontFamily.mono,
              }}
            >
              {formatDuration(run.duration)}
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder for step-level logs */}
      <div
        style={{
          backgroundColor: colors.background.elevated,
          borderRadius: radii.m,
          padding: spacing.xl,
          boxShadow: shadows.elevated,
          border: `1px solid ${colors.border.subtle}`,
          minHeight: "400px",
        }}
      >
        <h2
          style={{
            ...typography.heading.s,
            color: colors.text.primary,
            marginBottom: spacing.m,
          }}
        >
          Step Logs
        </h2>
        <div
          style={{
            color: colors.text.muted,
            ...typography.body.m,
            fontStyle: "italic",
          }}
        >
          Step-level logs placeholder
        </div>
      </div>
    </div>
  );
}

