import type { Metadata, Viewport } from "next";
import "@fontsource-variable/geist";
import "@fontsource-variable/fraunces";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: `${SITE_NAME} — Campus Management`, template: `%s · ${SITE_NAME}` },
  description:
    "Meridian University's campus portal: browse courses, enroll and pay tuition, manage classes and publish results.",
  openGraph: {
    title: `${SITE_NAME} — Campus Management`,
    description: "Courses, enrollment, tuition payments and results in one portal.",
    type: "website",
    siteName: SITE_NAME,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f6f0" },
    { media: "(prefers-color-scheme: dark)", color: "#14172b" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
