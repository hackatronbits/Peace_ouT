import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "../context/AppContext";
import NetworkStatus from "../components/AppStatus/NetworkCheck/NetworkStatus";
import { Suspense } from "react";
import { ThemeProvider } from "../context/ThemeContext";
import { VariablesProvider } from "../components/Conversation/VariablePrompt/VariableContext";
import JsonLd from "../utils/seo/JsonLd";
import { App } from "antd";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | PromptCue",
    default: "PromptCue",
  },
  description:
    "Experience seamless conversations with leading AI models through a unified, elegant interface.",
  robots: process.env.NEXT_PUBLIC_SITE_URL?.includes("sandbox.promptcue.com")
    ? { index: false, follow: false }
    : { index: true, follow: true },
  metadataBase: new URL(
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_SITE_URL?.includes("sandbox.promptcue.com")
        ? "https://sandbox.promptcue.com"
        : "https://promptcue.com"
      : "http://localhost:3000",
  ),
  openGraph: {
    title: "PromptCue",
    description:
      "Experience seamless conversations with leading AI models through a unified, elegant interface.",
    images: "/og-image.jpg",
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptCue",
    description:
      "Experience seamless conversations with leading AI models through a unified, elegant interface.",
    images: "/og-image.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
        />
        <JsonLd type="software" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Suspense>
          <App>
            <AppProvider>
              <ThemeProvider>
                <VariablesProvider>
                  <NetworkStatus />
                  <div className="app-container">{children}</div>
                </VariablesProvider>
              </ThemeProvider>
            </AppProvider>
          </App>
        </Suspense>
      </body>
    </html>
  );
}
