"use client";

import { useRuns, usePipelines } from "@soma-forge/forge-core";
import { colors, spacing, radii, shadows, typography } from "@/lib/tokens";
import Link from "next/link";

export default function RunsTable() {
  const runs = useRuns();
  const pipelines = usePipelines();

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
    <div
      style={{
        backgroundColor: colors.background.elevated,
        borderRadius: radii.m,
        padding: spacing.l,
        boxShadow: shadows.elevated,
        border: `1px solid ${colors.border.subtle}`,
      }}
    >
      <div
        style={{
          display: "table",
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
        }}
      >
        {/* Table Header */}
        <div
          style={{
            display: "table-row",
            borderBottom: `1px solid ${colors.border.subtle}`,
          }}
        >
          <div
            style={{
              display: "table-cell",
              padding: spacing.m,
              ...typography.label,
              color: colors.text.muted,
            }}
          >
            Run ID
          </div>
          <div
            style={{
              display: "table-cell",
              padding: spacing.m,
              ...typography.label,
              color: colors.text.muted,
            }}
          >
            Pipeline
          </div>
          <div
            style={{
              display: "table-cell",
              padding: spacing.m,
              ...typography.label,
              color: colors.text.muted,
            }}
          >
            Status
          </div>
          <div
            style={{
              display: "table-cell",
              padding: spacing.m,
              ...typography.label,
              color: colors.text.muted,
            }}
          >
            Trigger
          </div>
          <div
            style={{
              display: "table-cell",
              padding: spacing.m,
              ...typography.label,
              color: colors.text.muted,
            }}
          >
            Started
          </div>
          <div
            style={{
              display: "table-cell",
              padding: spacing.m,
              ...typography.label,
              color: colors.text.muted,
            }}
          >
            Duration
          </div>
        </div>

        {/* Table Rows */}
        {runs.length === 0 ? (
          <div
            style={{
              display: "table-row",
            }}
          >
            <div
              style={{
                display: "table-cell",
                padding: spacing.xl,
                color: colors.text.muted,
                ...typography.body.m,
                textAlign: "center",
                gridColumn: "1 / -1",
              }}
            >
              No runs found
            </div>
          </div>
        ) : (
          runs.map((run) => (
            <Link
              key={run.id}
              href={`/runs/${run.id}`}
              style={{
                display: "table-row",
                textDecoration: "none",
                color: colors.text.primary,
                transition: `background-color 200ms`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.background.surface;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <div
                style={{
                  display: "table-cell",
                  padding: spacing.m,
                  ...typography.body.m,
                  fontFamily: typography.fontFamily.mono,
                  fontSize: typography.body.s.fontSize,
                  borderBottom: `1px solid ${colors.border.subtle}`,
                }}
              >
                {run.id.slice(0, 12)}...
              </div>
              <div
                style={{
                  display: "table-cell",
                  padding: spacing.m,
                  ...typography.body.m,
                  color: colors.text.secondary,
                  borderBottom: `1px solid ${colors.border.subtle}`,
                }}
              >
                {getPipelineName(run.pipelineId)}
              </div>
              <div
                style={{
                  display: "table-cell",
                  padding: spacing.m,
                  borderBottom: `1px solid ${colors.border.subtle}`,
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: `${spacing.xxs} ${spacing.s}`,
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
                  display: "table-cell",
                  padding: spacing.m,
                  ...typography.body.m,
                  color: colors.text.secondary,
                  textTransform: "capitalize",
                  borderBottom: `1px solid ${colors.border.subtle}`,
                }}
              >
                {run.trigger}
              </div>
              <div
                style={{
                  display: "table-cell",
                  padding: spacing.m,
                  ...typography.body.s,
                  color: colors.text.muted,
                  borderBottom: `1px solid ${colors.border.subtle}`,
                }}
              >
                {new Date(run.startedAt).toLocaleString()}
              </div>
              <div
                style={{
                  display: "table-cell",
                  padding: spacing.m,
                  ...typography.body.s,
                  color: colors.text.muted,
                  fontFamily: typography.fontFamily.mono,
                  borderBottom: `1px solid ${colors.border.subtle}`,
                }}
              >
                {formatDuration(run.duration)}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

