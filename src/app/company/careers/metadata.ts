import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers at PromptCue - Join the Future of AI Innovation",
  description:
    "Join PromptCue's talented team and help shape the future of AI interaction. Explore exciting opportunities in AI development, research, and product innovation.",
  keywords:
    "PromptCue careers, AI jobs, tech jobs, startup jobs, AI development careers, research positions, product innovation roles",
  alternates: {
    canonical: "/company/careers",
  },
  openGraph: {
    title: "Careers at PromptCue - Shape the Future of AI",
    description:
      "Join our team and help revolutionize AI interaction technology.",
    url: "/company/careers",
    siteName: "PromptCue",
    images: [
      {
        url: "/careers-hero.jpg",
        width: 1200,
        height: 630,
        alt: "PromptCue Careers and Culture",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Careers at PromptCue - Shape the Future of AI",
    description:
      "Join our team and help revolutionize AI interaction technology.",
    images: ["/careers-hero.jpg"],
  },
};
