"use client";

import { usePathname } from "next/navigation";
import { layout, colors, spacing, typography, radii } from "@/lib/tokens";

function getSectionName(pathname: string): string {
  if (pathname === "/") return "Dashboard";
  if (pathname.startsWith("/agents")) return "Agents";
  if (pathname.startsWith("/pipelines")) return "Pipelines";
  if (pathname.startsWith("/runs")) return "Runs";
  if (pathname.startsWith("/settings")) return "Settings";
  return "SomaForge";
}

export default function TopBar() {
  const pathname = usePathname();
  const sectionName = getSectionName(pathname);

  return (
    <header
      style={{
        height: layout.topBar.height,
        backgroundColor: colors.background.surface,
        borderBottom: `1px solid ${colors.border.subtle}`,
        padding: `0 ${spacing.xl}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "fixed",
        top: 0,
        left: layout.navRail.width,
        right: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: spacing.l }}>
        <h1
          style={{
            ...typography.heading.s,
            color: colors.text.primary,
            margin: 0,
          }}
        >
          SomaForge
        </h1>
        <span
          style={{
            color: colors.text.muted,
            fontSize: typography.body.m.fontSize,
          }}
        >
          /
        </span>
        <span
          style={{
            ...typography.body.m,
            color: colors.text.secondary,
          }}
        >
          {sectionName}
        </span>
      </div>
      
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: spacing.s,
        }}
      >
        <div
          style={{
            padding: `${spacing.xs} ${spacing.m}`,
            borderRadius: radii.pill,
            backgroundColor: colors.background.elevated,
            border: `1px solid ${colors.border.subtle}`,
            fontSize: typography.body.s.fontSize,
            color: colors.text.secondary,
          }}
        >
          Luna • dev
        </div>
      </div>
    </header>
  );
}

