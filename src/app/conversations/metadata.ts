import { Metadata } from "next";

export const metadata: Metadata = {
  description: "Access your personalized AI conversations and chat history.",
  // Prevent indexing of user-specific pages
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/conversations",
  },
};
