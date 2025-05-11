import { ReactNode } from "react";

// Schema Definitions
export const getSoftwareApplicationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PromptCue",
  applicationCategory: "ArtificialIntelligence",
  operatingSystem: "Web-based",
  description:
    "A universal AI chat interface featuring specialized AI agents for technical, research, and creative tasks. Connect with leading AI models and purpose-built agents for enhanced productivity.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "150",
  },
  featureList: [
    "Specialized AI Agents (Technical, Research, Creative)",
    "Technical Agent for code review and development",
    "Research Agent for in-depth analysis and data gathering",
    "Multi-model AI chat support",
    "Variable prompts system",
    "Conversation management",
    "Real-time chat interface",
    "Cross-platform compatibility",
  ],
  potentialAction: {
    "@type": "UseAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://promptcue.com/",
      actionPlatform: [
        "http://schema.org/DesktopWebPlatform",
        "http://schema.org/MobileWebPlatform",
      ],
    },
  },
});

export const getOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "PromptCue",
  url: "https://promptcue.com",
  logo: "https://promptcue.com/logo.png",
  sameAs: [
    "https://twitter.com/promptcue",
    "https://www.linkedin.com/company/promptcue",
    "https://github.com/promptcue",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "support@promptcue.com",
    areaServed: "Worldwide",
    availableLanguage: ["English"],
  },
});

export const getJobPostingSchema = () => ({
  "@context": "https://schema.org",
  "@type": "JobPosting",
  hiringOrganization: {
    "@type": "Organization",
    name: "PromptCue",
    sameAs: "https://promptcue.com",
  },
});

interface JsonLdProps {
  type: "software" | "organization" | "job" | "custom";
  customSchema?: object;
}

export default function JsonLd({ type, customSchema }: JsonLdProps): ReactNode {
  let schema;

  switch (type) {
    case "software":
      schema = getSoftwareApplicationSchema();
      break;
    case "organization":
      schema = getOrganizationSchema();
      break;
    case "job":
      schema = getJobPostingSchema();
      break;
    case "custom":
      schema = customSchema;
      break;
    default:
      schema = getSoftwareApplicationSchema();
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
