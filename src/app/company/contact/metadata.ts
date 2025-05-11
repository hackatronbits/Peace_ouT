import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact PromptCue - Get Support & Connect With Us",
  description:
    "Reach out to PromptCue for support, partnerships, or general inquiries. Our team is ready to help you maximize your AI chat and agent experience.",
  keywords:
    "contact PromptCue, AI support, technical support, business inquiries, partnership opportunities, customer service",
  alternates: {
    canonical: "/company/contact",
  },
  openGraph: {
    title: "Contact PromptCue - We're Here to Help",
    description:
      "Get in touch with our team for support, partnerships, or general inquiries.",
    url: "/company/contact",
    siteName: "PromptCue",
    images: [
      {
        url: "/contact-support.jpg",
        width: 1200,
        height: 630,
        alt: "PromptCue Support Team",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact PromptCue - We're Here to Help",
    description:
      "Get in touch with our team for support, partnerships, or general inquiries.",
    images: ["/contact-support.jpg"],
  },
};
