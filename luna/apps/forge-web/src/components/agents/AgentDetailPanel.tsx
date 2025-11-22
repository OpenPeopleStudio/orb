"use client";

import { useAgent } from "@soma-forge/forge-core";
import { colors, spacing, radii, shadows, typography } from "@/lib/tokens";
import { notFound } from "next/navigation";

interface AgentDetailPanelProps {
  agentId: string;
}

export default function AgentDetailPanel({ agentId }: AgentDetailPanelProps) {
  const agent = useAgent(agentId);

  if (!agent) {
    return (
      <div
        style={{
          padding: spacing.xl,
          color: colors.text.muted,
          ...typography.body.m,
        }}
      >
        Agent not found
      </div>
    );
  }

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
            }}
          >
            {agent.name}
          </h1>
          <span
            style={{
              display: "inline-block",
              padding: `${spacing.xs} ${spacing.m}`,
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
        {agent.description && (
          <p
            style={{
              ...typography.body.m,
              color: colors.text.secondary,
              margin: 0,
            }}
          >
            {agent.description}
          </p>
        )}
      </div>

      {/* Capabilities */}
      {agent.capabilities.length > 0 && (
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
            Capabilities
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: spacing.s }}>
            {agent.capabilities.map((capability) => (
              <span
                key={capability}
                style={{
                  padding: `${spacing.s} ${spacing.m}`,
                  borderRadius: radii.m,
                  backgroundColor: colors.background.surface,
                  color: colors.accent.primary,
                  ...typography.body.s,
                  border: `1px solid ${colors.border.accent}`,
                }}
              >
                {capability}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Details Panel */}
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
          Details
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: spacing.m }}>
          <div>
            <div
              style={{
                ...typography.label,
                color: colors.text.muted,
                marginBottom: spacing.xs,
              }}
            >
              Model
            </div>
            <div
              style={{
                ...typography.body.m,
                color: colors.text.primary,
                fontFamily: typography.fontFamily.mono,
              }}
            >
              {agent.model}
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
              Role
            </div>
            <div
              style={{
                ...typography.body.m,
                color: colors.text.primary,
              }}
            >
              {agent.role}
            </div>
          </div>
          {agent.tags.length > 0 && (
            <div>
              <div
                style={{
                  ...typography.label,
                  color: colors.text.muted,
                  marginBottom: spacing.xs,
                }}
              >
                Tags
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: spacing.xs }}>
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
          )}
        </div>
      </div>

      {/* Placeholder for future sections */}
      <div
        style={{
          backgroundColor: colors.background.elevated,
          borderRadius: radii.m,
          padding: spacing.xl,
          boxShadow: shadows.elevated,
          border: `1px solid ${colors.border.subtle}`,
          minHeight: "200px",
        }}
      >
        <div
          style={{
            color: colors.text.muted,
            ...typography.body.m,
            fontStyle: "italic",
          }}
        >
          {/* Placeholder for Pipeline usage and Recent runs */}
        </div>
      </div>
    </div>
  );
}

