"use client";

import NavRail from "./NavRail";
import TopBar from "./TopBar";
import ContentArea from "./ContentArea";
import { colors } from "@/lib/tokens";

interface ForgeShellLayoutProps {
  children: React.ReactNode;
}

export default function ForgeShellLayout({ children }: ForgeShellLayoutProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: colors.background.base,
        color: colors.text.primary,
      }}
    >
      <NavRail />
      <TopBar />
      <ContentArea>{children}</ContentArea>
    </div>
  );
}
