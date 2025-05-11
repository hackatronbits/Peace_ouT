import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { logAPIError, logAPIInfo } from "../../../../../utils/apiLogger";
import { MODELS, ModelProvider } from "../../../../../config/modelConfig";
import { formatImageGenerationRequest } from "../../../../../utils/imageGenerationUtils";

// Define interfaces for type safety
interface ImageGenerationRequest {
  model: string;
  imageModel: string;
  apiKey: string;
  prompt: string;
  chatId: string;
}

export async function POST(req: NextRequest) {
  let responseTime: number;
  let requestBody: Partial<ImageGenerationRequest> = {};

    try {
      // Enable CORS
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      };

      // Handle preflight requests
      if (req.method === "OPTIONS") {
        return NextResponse.json({}, { headers: corsHeaders });
      }

      // Parse the request body
      requestBody = await req.json();
      const { model, imageModel, apiKey, prompt, chatId } = requestBody;

      // Log request received
      logAPIInfo("ai_image", "request_started", {
        component: "image",
        metadata: {
          chatId,
          model,
          promptLength: prompt?.length || 0,
          timestamp: new Date().toISOString(),
        },
      });

      // Validate input
      if (!model || !apiKey || !prompt) {
        logAPIError(
          "ai_image",
          "validation_failed",
          new Error("Missing required fields"),
          {
            component: "image",
            metadata: {
              chatId,
              model,
              missingFields: [
                !model && "model",
                !apiKey && "apiKey",
                !prompt && "prompt",
              ].filter(Boolean),
            },
          },
        );

        return NextResponse.json(
          { error: "Missing required parameters" },
          { status: 400, headers: corsHeaders },
        );
      }

      const modelConfig = MODELS[model];
      if (!modelConfig?.features?.supportsImageGeneration) {
        return NextResponse.json(
          { error: "Selected model does not support image generation" },
          { status: 400, headers: corsHeaders },
        );
      }

      // Prepare API request based on the provider
      const startTime = Date.now();
      let apiResponse;

      try {
        // Format request data based on provider
        const requestData = {
          ...formatImageGenerationRequest(
            modelConfig.provider,
            prompt,
            modelConfig,
          ),
          model: imageModel,
        };

        // Set up headers based on provider
        const headers =
          modelConfig.provider === ModelProvider.OpenAI
            ? {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              }
            : {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              };

        apiResponse = await axios.post(
          String(modelConfig.features?.imageGenerationEndpoint),
          requestData,
          { headers, timeout: 30000 }, // Longer timeout for image generation
        );

        // Extract image URL based on provider
        let imageUrl = "";
        if (modelConfig.provider === ModelProvider.OpenAI) {
          imageUrl = apiResponse.data.data[0].url;
        } else if (modelConfig.provider === ModelProvider.Google) {
          // Extract URL from Gemini response
          imageUrl = apiResponse.data.candidates[0].content[0].parts[0].text;
        }

        responseTime = Date.now() - startTime;

        // Log success
        logAPIInfo("ai_image", "request_completed", {
          component: "image",
          duration: responseTime,
          metadata: {
            chatId,
            model,
            status: "success",
          },
        });

        return NextResponse.json(
          {
            imageUrl,
            model,
            responseTime,
          },
          { headers: corsHeaders },
        );
      } catch (apiError) {
        const statusCode = apiError.response?.status || 500;
        const errorMessage =
          apiError.response?.data?.error || "Image generation failed";

        logAPIError("ai_image", "ai_provider_error", apiError, {
          component: "image",
          duration: Date.now() - startTime,
          metadata: {
            chatId,
            model,
            statusCode: apiError.response?.status,
            errorMessage:
              apiError.response?.data?.error?.message || apiError.message,
            errorType: "ai_provider",
          },
        });

        return NextResponse.json(
          { error: errorMessage },
          { status: statusCode, headers: corsHeaders },
        );
      }
    } catch (error) {
      logAPIError("ai_image", "unexpected_error", error, {
        component: "image",
        metadata: {
          chatId: requestBody.chatId,
          model: requestBody.model,
        },
      });

      return NextResponse.json(
        { error: "An unexpected error occurred" },
        { status: 500, headers: { "Access-Control-Allow-Origin": "*" } },
      );
    }
}
