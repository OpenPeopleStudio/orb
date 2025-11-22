import type { Metadata } from "next";
import "../src/styles/globals.css";
import ForgeShellLayout from "../src/components/layout/ForgeShellLayout";

export const metadata: Metadata = {
  title: "SomaForge",
  description: "Forge Control Center - Agent-building system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ForgeShellLayout>{children}</ForgeShellLayout>
      </body>
    </html>
  );
}
