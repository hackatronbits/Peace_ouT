import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Agents - PromptCue | Technical & Research Assistants",
  description:
    "Leverage specialized AI agents for technical development, research analysis, and creative tasks. Our purpose-built agents enhance your workflow with expert assistance.",
  keywords:
    "AI agents, technical agent, research agent, code review, development assistant, research analysis, AI assistant, machine learning, specialized AI, workflow automation",
  alternates: {
    canonical: "/agents",
  },
  openGraph: {
    title: "AI Agents - Technical & Research Assistants | PromptCue",
    description:
      "Specialized AI agents for technical development, research analysis, and creative tasks. Enhance your workflow with expert AI assistance.",
    images: [
      {
        url: "/ai-agents-overview.jpg",
        width: 1200,
        height: 630,
        alt: "PromptCue AI Agents Overview",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Agents - Technical & Research Assistants",
    description:
      "Specialized AI agents for technical development, research analysis, and creative tasks.",
    images: ["/ai-agents-overview.jpg"],
  },
};

export default function AgentsPage() {
  return <div>{/* Your agents page content */}</div>;
}
