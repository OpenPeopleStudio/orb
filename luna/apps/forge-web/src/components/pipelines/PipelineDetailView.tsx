"use client";

import { usePipeline, useAgents } from "@soma-forge/forge-core";
import { colors, spacing, radii, shadows, typography } from "@/lib/tokens";

interface PipelineDetailViewProps {
  pipelineId: string;
}

export default function PipelineDetailView({ pipelineId }: PipelineDetailViewProps) {
  const pipeline = usePipeline(pipelineId);
  const agents = useAgents();

  if (!pipeline) {
    return (
      <div
        style={{
          padding: spacing.xl,
          color: colors.text.muted,
          ...typography.body.m,
        }}
      >
        Pipeline not found
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

  const getAgentName = (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    return agent?.name || agentId;
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
            {pipeline.name}
          </h1>
          <span
            style={{
              display: "inline-block",
              padding: `${spacing.xs} ${spacing.m}`,
              borderRadius: radii.pill,
              backgroundColor: `${getStatusColor(pipeline.status)}20`,
              color: getStatusColor(pipeline.status),
              ...typography.body.s,
              textTransform: "capitalize",
            }}
          >
            {pipeline.status}
          </span>
        </div>
        {pipeline.description && (
          <p
            style={{
              ...typography.body.m,
              color: colors.text.secondary,
              margin: 0,
            }}
          >
            {pipeline.description}
          </p>
        )}
      </div>

      {/* Steps */}
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
          Steps
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: spacing.m }}>
          {pipeline.steps.map((step, index) => (
            <div
              key={step.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: spacing.m,
                padding: spacing.m,
                borderRadius: radii.s,
                backgroundColor: colors.background.surface,
                border: `1px solid ${colors.border.subtle}`,
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: colors.background.elevated,
                  border: `2px solid ${colors.border.accent}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  ...typography.body.s,
                  color: colors.accent.primary,
                  fontWeight: 600,
                }}
              >
                {step.index + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    ...typography.body.m,
                    color: colors.text.primary,
                    marginBottom: spacing.xxs,
                  }}
                >
                  {step.name}
                </div>
                <div
                  style={{
                    ...typography.body.s,
                    color: colors.text.muted,
                  }}
                >
                  Agent: {getAgentName(step.agentId)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Placeholder for visual flow view */}
      <div
        style={{
          backgroundColor: colors.background.elevated,
          borderRadius: radii.m,
          padding: spacing.xl,
          boxShadow: shadows.elevated,
          border: `1px solid ${colors.border.subtle}`,
          minHeight: "300px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            color: colors.text.muted,
            ...typography.body.m,
            fontStyle: "italic",
          }}
        >
          Visual flow view placeholder
        </div>
      </div>
    </div>
  );
}

