import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { APP_NAME, APP_TAGLINE } from "@feri/shared";
import "./globals.css";

const DEFAULT_SITE_URL = "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(process.env["NEXT_PUBLIC_SITE_URL"] ?? DEFAULT_SITE_URL),
  title: {
    default: `${APP_NAME} - pre-loved finds from sellers you can trust`,
    template: `%s | ${APP_NAME}`,
  },
  description: `${APP_TAGLINE} Buy and sell pre-loved clothes, watches, bags and tech in Nepal.`,
  applicationName: APP_NAME,
};

export const viewport: Viewport = {
  themeColor: "#473536",
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="en">
    <body className="min-h-dvh bg-canvas font-sans text-body antialiased">{children}</body>
  </html>
);

export default RootLayout;
