import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About PromptCue - Leading AI Chat Platform & Innovation",
  description:
    "Learn about PromptCue's mission to revolutionize AI interactions through specialized agents and innovative chat solutions. Discover our team, values, and vision for the future of AI communication.",
  keywords:
    "PromptCue company, AI innovation, tech startup, AI platform team, company mission, AI technology vision, AI chat platform company",
  alternates: {
    canonical: "/company/about",
  },
  openGraph: {
    title: "About PromptCue - Leading AI Chat Innovation",
    description:
      "Discover PromptCue's mission and vision for revolutionizing AI interactions.",
    url: "/company/about",
    siteName: "PromptCue",
    images: [
      {
        url: "/about-team.jpg",
        width: 1200,
        height: 630,
        alt: "PromptCue Team and Vision",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About PromptCue - Leading AI Chat Innovation",
    description:
      "Discover PromptCue's mission and vision for revolutionizing AI interactions.",
    images: ["/about-team.jpg"],
  },
};
