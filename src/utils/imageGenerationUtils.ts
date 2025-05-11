import { ModelProvider } from "../config/modelConfig";
import { logAPIInfo, logAPIError, logAPIWarning } from "./apiLogger";

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

export const formatImageGenerationRequest = (
  provider: ModelProvider,
  prompt: string,
  modelConfig: any,
) => {
  logAPIInfo("image_generation", "format_request", {
    component: "image_generation",
    action: "format_request_start",
    metadata: {
      provider,
      prompt_length: prompt.length,
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
        logAPIInfo("image_generation", "format_request", {
          component: "image_generation",
          action: "openai_params_formatted",
          metadata: {
            model: openAIParams.imageModel,
            size: openAIParams.size,
          },
        });
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
        logAPIInfo("image_generation", "format_request", {
          component: "image_generation",
          action: "gemini_params_formatted",
          metadata: {
            imageModel: geminiParams.imageModel,
            aspect_ratio: geminiParams.aspect_ratio,
          },
        });
        return geminiParams;

      default:
        const error = new Error(`Unsupported provider: ${provider}`);
        logAPIError("image_generation", "format_request", error, {
          component: "image_generation",
          action: "unsupported_provider",
          metadata: {
            provider,
          },
        });
        throw error;
    }
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logAPIError("image_generation", "format_request", error, {
      component: "image_generation",
      action: "format_request_error",
      metadata: {
        provider,
      },
    });
    throw error;
  }
};

export const extractImageUrlFromResponse = (
  provider: ModelProvider,
  response: any,
): string => {
  logAPIInfo("image_generation", "extract_url", {
    component: "image_generation",
    action: "extract_url_start",
    metadata: {
      provider,
    },
  });

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
        logAPIError("image_generation", "extract_url", error, {
          component: "image_generation",
          action: "unsupported_provider",
          metadata: {
            provider,
          },
        });
        throw error;
    }

    if (!url) {
      logAPIWarning("image_generation", "extract_url", {
        component: "image_generation",
        action: "empty_url",
        metadata: {
          provider,
        },
      });
    }

    logAPIInfo("image_generation", "extract_url", {
      component: "image_generation",
      action: "url_extracted",
      metadata: {
        provider,
        url_length: url.length,
      },
    });

    return url;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logAPIError("image_generation", "extract_url", error, {
      component: "image_generation",
      action: "extract_url_error",
      metadata: {
        provider,
      },
    });
    throw error;
  }
};
