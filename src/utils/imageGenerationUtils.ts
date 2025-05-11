import { ModelProvider } from "../config/modelConfig";
import { featureUsageLogger } from "./featureUsageLogger";

interface OpenAIImageParams {
  imageModel: string;
  prompt: string;
  n: number;
  size: string;
  quality?: string;
  style?: string;
  response_format: string;
  user?: string;
}

interface GeminiImageParams {
  imageModel: string;
  prompt: string;
  negative_prompt?: string;
  number_of_images?: number;
  aspect_ratio?: string;
  safety_filter_level?: string;
  person_generation?: string;
}

export const formatImageGenerationRequest = async (
  provider: ModelProvider,
  prompt: string,
  modelConfig: any,
) => {
  await featureUsageLogger({
    featureName: "image_generation_prep",
    eventType: "prep_started",
    eventMetadata: {
      prompt,
      provider,
      timestamp: new Date().toISOString(),
    },
  });

  try {
    switch (provider) {
      case ModelProvider.OpenAI:
        const openAIParams: OpenAIImageParams = {
          imageModel: "dall-e-3", // Using DALL-E 3 for better quality
          prompt,
          n: 1,
          size: "1024x1024",
          quality: "hd",
          style: "vivid",
          response_format: "url",
        };
        return openAIParams;

      case ModelProvider.Google:
        const geminiParams: GeminiImageParams = {
          imageModel: "imagen-3.0-generate-002",
          prompt,
          number_of_images: 1,
          aspect_ratio: "1:1",
          safety_filter_level: "BLOCK_MEDIUM_AND_ABOVE",
          person_generation: "ALLOW_ADULT",
        };
        return geminiParams;

      default:
        const error = new Error(`Unsupported provider: ${provider}`);
        throw error;
    }
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    throw error;
  }
};

export const extractImageUrlFromResponse = (
  provider: ModelProvider,
  response: any,
): string => {
  try {
    let url: string;
    switch (provider) {
      case ModelProvider.OpenAI:
        url = response.data[0].url;
        break;
      case ModelProvider.Google:
        url = response.candidates[0].content[0].parts[0].text;
        break;
      default:
        const error = new Error(`Unsupported provider: ${provider}`);
        throw error;
    }
    return url;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    throw error;
  }
};
