// Platform detection utilities

const getPlatform = (): string => {
  if (typeof window === "undefined") return "";

  // Try modern userAgentData first
  // @ts-ignore - TypeScript doesn't recognize userAgentData yet
  if (navigator.userAgentData?.platform) {
    // @ts-ignore
    return navigator.userAgentData.platform.toLowerCase();
  }

  // Fallback to userAgent parsing
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes("mac")) return "macos";
  if (userAgent.includes("win")) return "windows";
  if (userAgent.includes("linux")) return "linux";
  return "";
};

export const isMacOS = (): boolean => {
  // Check if we're in a browser environment
  if (typeof window !== "undefined") {
    return getPlatform() === "macos";
  }
  return false;
};

export const isWindows = (): boolean => {
  if (typeof window !== "undefined") {
    return getPlatform() === "windows";
  }
  return false;
};

export const isLinux = (): boolean => {
  if (typeof window !== "undefined") {
    return getPlatform() === "linux";
  }
  return false;
};
