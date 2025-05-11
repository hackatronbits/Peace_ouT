import { Metadata } from "next";

export const metadata: Metadata = {
  title: "What's New at PromptCue - Latest Features & Updates",
  description:
    "Stay updated with PromptCue's latest features, improvements, and AI capabilities. Discover new specialized agents, models, and platform enhancements.",
  keywords:
    "new features, platform updates, AI improvements, release notes, product updates, feature announcements, AI capabilities",
  alternates: {
    canonical: "/info/whatsnew",
  },
  openGraph: {
    title: "What's New at PromptCue",
    description: "Discover our latest features and platform improvements.",
    url: "/info/whatsnew",
    siteName: "PromptCue",
    type: "article",
    publishedTime: new Date().toISOString(),
    modifiedTime: new Date().toISOString(),
    section: "Product Updates",
  },
  twitter: {
    card: "summary",
    title: "What's New at PromptCue",
    description: "Discover our latest features and platform improvements.",
  },
};
