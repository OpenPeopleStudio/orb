"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { layout, colors, spacing, radii, motion } from "@/lib/tokens";

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", path: "/", icon: "📊" },
  { label: "Agents", path: "/agents", icon: "🤖" },
  { label: "Pipelines", path: "/pipelines", icon: "⚙️" },
  { label: "Runs", path: "/runs", icon: "▶️" },
  { label: "Settings", path: "/settings", icon: "⚙️" },
];

export default function NavRail() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        width: layout.navRail.width,
        height: "100vh",
        backgroundColor: colors.background.surface,
        borderRight: `1px solid ${colors.border.subtle}`,
        padding: spacing.m,
        display: "flex",
        flexDirection: "column",
        gap: spacing.xs,
        position: "fixed",
        left: 0,
        top: 0,
      }}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));
        
        return (
          <Link
            key={item.path}
            href={item.path}
            style={{
              display: "flex",
              alignItems: "center",
              gap: spacing.s,
              padding: `${spacing.s} ${spacing.m}`,
              borderRadius: radii.m,
              textDecoration: "none",
              color: isActive ? colors.text.primary : colors.text.secondary,
              backgroundColor: isActive ? colors.background.elevated : "transparent",
              border: isActive ? `1px solid ${colors.border.accent}` : `1px solid transparent`,
              transition: `all ${motion.duration.s} ${motion.easing.smooth}`,
              transform: isActive ? `scale(${motion.scale.hover})` : "scale(1)",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = colors.background.elevated;
                e.currentTarget.style.transform = `scale(${motion.scale.hover})`;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.transform = "scale(1)";
              }
            }}
          >
            <span style={{ fontSize: "1.25rem" }}>{item.icon}</span>
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

