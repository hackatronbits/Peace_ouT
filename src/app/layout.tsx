import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "../context/AppContext";
import NetworkStatus from "../components/AppStatus/NetworkCheck/NetworkStatus";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | PromptCue",
    default: "PromptCue",
  },
  description: "Engage. Connect. Interact with Intelligence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Suspense>
          <AppProvider>
            <NetworkStatus />
            <div className="app-container">{children}</div>
          </AppProvider>
        </Suspense>
      </body>
    </html>
  );
}
