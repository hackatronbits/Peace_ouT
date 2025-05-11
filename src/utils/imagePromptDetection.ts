import { logAPIInfo, logAPIWarning } from "./apiLogger";

interface ImagePromptResult {
  isImageRequest: boolean;
}

export const analyzeImagePrompt = (prompt: string): ImagePromptResult => {
  const prompt_lower = prompt.toLowerCase().trim();

  logAPIInfo("image_prompt_detection", "analyze", {
    component: "image_prompt_detection",
    action: "analyze_start",
    metadata: {
      prompt_length: prompt.length,
    },
  });

  // Check for explicit negations first
  const negationPatterns = [
    "no image",
    "don't generate image",
    "do not generate image",
    "without image",
    "i don't want image",
    "not an image",
  ];

  for (const pattern of negationPatterns) {
    if (prompt_lower.includes(pattern)) {
      logAPIInfo("image_prompt_detection", "analyze", {
        component: "image_prompt_detection",
        action: "negation_detected",
        metadata: {
          pattern,
        },
      });
      return {
        isImageRequest: false,
      };
    }
  }

  // Check for image generation requests - more flexible patterns
  const imageRequestPatterns = [
    "generate image",
    "create image",
    "make image",
    "draw",
    "show me",
    "visualize",
    "generate a picture",
    "create a picture",
    "make a picture",
    "generate an illustration",
    "create an illustration",
    "can you generate an image",
    "could you generate an image",
    "generate an image",
    "create an image",
    "make an image",
    "image of",
    "picture of",
  ];

  for (const pattern of imageRequestPatterns) {
    if (prompt_lower.includes(pattern)) {
      logAPIInfo("image_prompt_detection", "analyze", {
        component: "image_prompt_detection",
        action: "image_request_detected",
        metadata: {
          pattern,
        },
      });
      return {
        isImageRequest: true,
      };
    }
  }

  // Check for descriptive language typically used for image generation
  const descriptivePatterns = [
    "style of",
    "looking like",
    "that looks like",
    "depicting",
    "showing",
    "resembling",
    "in the style of",
    "artwork of",
    "picture of",
  ];

  for (const pattern of descriptivePatterns) {
    if (prompt_lower.includes(pattern)) {
      logAPIInfo("image_prompt_detection", "analyze", {
        component: "image_prompt_detection",
        action: "descriptive_pattern_detected",
        metadata: {
          pattern,
        },
      });
      return {
        isImageRequest: true,
      };
    }
  }

  logAPIInfo("image_prompt_detection", "analyze", {
    component: "image_prompt_detection",
    action: "no_pattern_detected",
    metadata: {
      prompt_length: prompt.length,
    },
  });

  return {
    isImageRequest: false,
  };
};
