import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PromptCue - Intelligent AI Chat Platform with Specialized Agents",
  description:
    "Transform your workflow with PromptCue's advanced AI chat platform. Features specialized agents for technical, research, and creative tasks, supporting multiple AI models including GPT-4, Claude, and Gemini.",
  keywords:
    "AI chat platform, technical agents, research assistants, GPT-4, Claude, Gemini, AI workflow, prompt engineering, conversation management",
  alternates: {
    canonical: "/home",
  },
  openGraph: {
    title: "PromptCue - Intelligent AI Chat Platform",
    description:
      "Transform your workflow with PromptCue's advanced AI chat platform and specialized agents.",
    url: "/home",
    siteName: "PromptCue",
    images: [
      {
        url: "/home-hero.jpg",
        width: 1200,
        height: 630,
        alt: "PromptCue Platform Overview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptCue - Intelligent AI Chat Platform",
    description:
      "Transform your workflow with PromptCue's advanced AI chat platform and specialized agents.",
    images: ["/home-hero.jpg"],
    creator: "@promptcue",
  },
};
