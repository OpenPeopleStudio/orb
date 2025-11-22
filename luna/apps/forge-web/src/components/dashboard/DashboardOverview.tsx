"use client";

import { usePipelines, useRuns, useAgents } from "@soma-forge/forge-core";
import { colors, spacing, radii, shadows, typography } from "@/lib/tokens";
import Link from "next/link";

export default function DashboardOverview() {
  const pipelines = usePipelines();
  const runs = useRuns();
  const agents = useAgents();
  
  const recentRuns = runs.slice(0, 10).sort((a, b) => 
    new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing.xl }}>
      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: spacing.l,
        }}
      >
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
              ...typography.label,
              color: colors.text.muted,
              marginBottom: spacing.xs,
            }}
          >
            Pipelines
          </div>
          <div
            style={{
              ...typography.heading.l,
              color: colors.text.primary,
            }}
          >
            {pipelines.length}
          </div>
        </div>

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
              ...typography.label,
              color: colors.text.muted,
              marginBottom: spacing.xs,
            }}
          >
            Agents
          </div>
          <div
            style={{
              ...typography.heading.l,
              color: colors.text.primary,
            }}
          >
            {agents.length}
          </div>
        </div>

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
              ...typography.label,
              color: colors.text.muted,
              marginBottom: spacing.xs,
            }}
          >
            Total Runs
          </div>
          <div
            style={{
              ...typography.heading.l,
              color: colors.text.primary,
            }}
          >
            {runs.length}
          </div>
        </div>
      </div>

      {/* Recent Runs */}
      <div
        style={{
          backgroundColor: colors.background.elevated,
          borderRadius: radii.m,
          padding: spacing.l,
          boxShadow: shadows.elevated,
          border: `1px solid ${colors.border.subtle}`,
        }}
      >
        <h2
          style={{
            ...typography.heading.m,
            color: colors.text.primary,
            marginBottom: spacing.l,
          }}
        >
          Recent Runs
        </h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: spacing.s,
          }}
        >
          {recentRuns.length === 0 ? (
            <div style={{ color: colors.text.muted, ...typography.body.m }}>
              No runs yet
            </div>
          ) : (
            recentRuns.map((run) => (
              <Link
                key={run.id}
                href={`/runs/${run.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: spacing.m,
                  borderRadius: radii.s,
                  backgroundColor: colors.background.surface,
                  border: `1px solid ${colors.border.subtle}`,
                  textDecoration: "none",
                  color: colors.text.primary,
                  transition: `all 200ms ease`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.border.accent;
                  e.currentTarget.style.backgroundColor = colors.background.base;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border.subtle;
                  e.currentTarget.style.backgroundColor = colors.background.surface;
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: spacing.m }}>
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: getStatusColor(run.status),
                    }}
                  />
                  <span style={{ ...typography.body.m, fontFamily: typography.fontFamily.mono }}>
                    {run.id.slice(0, 8)}...
                  </span>
                  <span style={{ ...typography.body.s, color: colors.text.muted }}>
                    {run.pipelineId}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: spacing.m }}>
                  <span
                    style={{
                      ...typography.body.s,
                      color: getStatusColor(run.status),
                      textTransform: "capitalize",
                    }}
                  >
                    {run.status}
                  </span>
                  <span style={{ ...typography.body.s, color: colors.text.muted }}>
                    {new Date(run.startedAt).toLocaleString()}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

