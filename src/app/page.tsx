import PromptCueHome from "./home/page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PromptCue - Your Universal AI Chat Interface",
  description:
    "Experience seamless conversations with leading AI models through a unified, elegant interface. Connect with GPT-4, Gemini, Claude, and more in one place.",
  keywords:
    "AI chat, GPT-4, Gemini, Claude, AI models, conversation interface, prompt engineering, AI assistant, natural language processing, machine learning chat",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: "PromptCue - Your Universal AI Chat Interface",
    description:
      "Experience seamless conversations with leading AI models through a unified, elegant interface. Connect with GPT-4, Gemini, Claude, and more in one place.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PromptCue Interface",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptCue - Your Universal AI Chat Interface",
    description:
      "Experience seamless conversations with leading AI models through a unified, elegant interface.",
    images: ["/og-image.jpg"],
    creator: "@promptcue",
  },
  verification: {
    google: "your-google-site-verification",
  },
};

export default function Home() {
  return <PromptCueHome />;
}
