"use client";

import { layout, spacing } from "@/lib/tokens";

interface ContentAreaProps {
  children: React.ReactNode;
}

export default function ContentArea({ children }: ContentAreaProps) {
  return (
    <main
      style={{
        marginLeft: layout.navRail.width,
        marginTop: layout.topBar.height,
        padding: spacing.xl,
        maxWidth: layout.maxWidth.content,
        width: "100%",
      }}
    >
      {children}
    </main>
  );
}

