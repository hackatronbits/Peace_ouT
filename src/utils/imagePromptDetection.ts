interface ImagePromptResult {
  isImageRequest: boolean;
}

export const analyzeImagePrompt = (prompt: string): ImagePromptResult => {
  const prompt_lower = prompt.toLowerCase().trim();

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
      return {
        isImageRequest: true,
      };
    }
  }

  return {
    isImageRequest: false,
  };
};
