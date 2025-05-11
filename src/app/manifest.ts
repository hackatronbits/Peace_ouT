import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PromptCue - AI Chat & Specialized Agents",
    short_name: "PromptCue",
    description:
      "Universal AI chat interface with specialized agents for technical, research, and creative tasks.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    // icons: [
    //   {
    //     src: "/icon-192x192.png",
    //     sizes: "192x192",
    //     type: "image/png",
    //   },
    //   {
    //     src: "/icon-512x512.png",
    //     sizes: "512x512",
    //     type: "image/png",
    //   },
    //   {
    //     src: "/icon-192x192-maskable.png",
    //     sizes: "192x192",
    //     type: "image/png",
    //     purpose: "maskable",
    //   },
    // ],
  };
}
