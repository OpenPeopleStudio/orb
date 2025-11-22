"use client";

import { useAgents } from "@soma-forge/forge-core";
import { colors, spacing, radii, shadows, typography } from "@/lib/tokens";
import Link from "next/link";

export default function AgentsTable() {
  const agents = useAgents();

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
            Name
          </div>
          <div
            style={{
              display: "table-cell",
              padding: spacing.m,
              ...typography.label,
              color: colors.text.muted,
            }}
          >
            Role
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
            Model
          </div>
          <div
            style={{
              display: "table-cell",
              padding: spacing.m,
              ...typography.label,
              color: colors.text.muted,
            }}
          >
            Tags
          </div>
        </div>

        {/* Table Rows */}
        {agents.length === 0 ? (
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
              No agents found
            </div>
          </div>
        ) : (
          agents.map((agent) => (
            <Link
              key={agent.id}
              href={`/agents/${agent.id}`}
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
                  borderBottom: `1px solid ${colors.border.subtle}`,
                }}
              >
                {agent.name}
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
                {agent.role}
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
                    backgroundColor: `${getStatusColor(agent.status)}20`,
                    color: getStatusColor(agent.status),
                    ...typography.body.s,
                    textTransform: "capitalize",
                  }}
                >
                  {agent.status}
                </span>
              </div>
              <div
                style={{
                  display: "table-cell",
                  padding: spacing.m,
                  ...typography.body.m,
                  color: colors.text.secondary,
                  fontFamily: typography.fontFamily.mono,
                  fontSize: typography.body.s.fontSize,
                  borderBottom: `1px solid ${colors.border.subtle}`,
                }}
              >
                {agent.model}
              </div>
              <div
                style={{
                  display: "table-cell",
                  padding: spacing.m,
                  borderBottom: `1px solid ${colors.border.subtle}`,
                }}
              >
                <div style={{ display: "flex", gap: spacing.xs, flexWrap: "wrap" }}>
                  {agent.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: `${spacing.xxs} ${spacing.s}`,
                        borderRadius: radii.xs,
                        backgroundColor: colors.background.surface,
                        color: colors.text.muted,
                        ...typography.body.s,
                        fontSize: "0.75rem",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

