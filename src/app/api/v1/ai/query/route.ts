import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { logAPIError, logAPIInfo } from "../../../../../utils/apiLogger";
import { MODELS } from "../../../../../config/modelConfig";

// Define interfaces for type safety
interface ModelChatRequest {
  model: string;
  apiKey: string;
  prompt: string;
  messages?: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
  // Add model settings
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  responseFormat?: string;
  customInstructions?: string;
  chatId: string;
}

export async function POST(req: NextRequest) {
  let responseTime: number;
  let requestBody: Partial<ModelChatRequest> = {};

    try {
      // Enable CORS
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      };

      // Handle preflight requests
      if (req.method === "OPTIONS") {
        return NextResponse.json(
          {},
          {
            headers: corsHeaders,
          },
        );
      }

      try {
        // Parse the request body
        requestBody = await req.json();
        const {
          model,
          apiKey,
          prompt,
          messages = [],
          temperature,
          maxTokens,
          topP,
          frequencyPenalty,
          presencePenalty,
          customInstructions,
          chatId,
        } = requestBody;

        // Log request received
        logAPIInfo("ai_query", "request_started", {
          component: "query",
          metadata: {
            chatId: chatId,
            model,
            messageCount: messages.length,
            promptLength: prompt?.length || 0,
            timestamp: new Date().toISOString(),
          },
        });

        // Validate input
        if (!model || !apiKey || !prompt) {
          logAPIError(
            "ai_query",
            "validation_failed",
            new Error("Missing required fields"),
            {
              component: "query",
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
            {
              status: 400,
              headers: corsHeaders,
            },
          );
        }

        // Prepare API request based on the model
        const startTime = Date.now();

        // Prepare API request based on the model
        let apiResponse;
        switch (model) {
          case "gpt-4o-mini":
          case "gpt-4o":
          case "chatgpt-4o-latest":
          case "o1":
          case "o1-mini":
          case "gpt-3.5-turbo-16k":
          case "gpt-3.5-turbo":
            try {
              apiResponse = await axios.post(
                MODELS[model].apiEndpoint,
                {
                  model,
                  messages: [
                    ...messages,
                    { role: "system", content: customInstructions },
                    { role: "user", content: prompt },
                  ],
                  max_tokens: maxTokens,
                  temperature,
                  top_p: topP,
                  frequency_penalty: frequencyPenalty,
                  presence_penalty: presencePenalty,
                },
                {
                  headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                  },
                  timeout: 10000,
                },
              );
            } catch (apiError) {
              const statusCode = apiError.response?.status || 500;

              const errorMessage =
                apiError.response?.data?.error || "API request failed";

              logAPIError("ai_query", "ai_provider_error", apiError, {
                component: "query",
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
                {
                  status: statusCode,
                  headers: corsHeaders,
                },
              );
            }

            logAPIInfo("ai_query", "request_completed", {
              component: "query",
              duration: Date.now() - startTime,
              metadata: {
                chatId,
                model,
                status: "success",
                responseLength: apiResponse.data?.length || 0,
                tokensUsed: apiResponse.data?.tokens_used,
                responseTime: Date.now() - startTime,
              },
            });

            responseTime = Date.now() - startTime;
            return NextResponse.json(
              {
                response: apiResponse.data.choices[0].message.content,
                model: model,
                tokens_used: apiResponse.data.usage.total_tokens,
                responseTime,
              },
              {
                headers: corsHeaders,
              },
            );

          case "claude-2":
            try {
              apiResponse = await axios.post(
                MODELS[model].apiEndpoint,
                {
                  model: "claude-2",
                  messages: [...messages, { role: "user", content: prompt }],
                },
                {
                  headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                  },
                },
              );
            } catch (apiError) {
              const statusCode = apiError.response?.status || 500;
              const errorMessage =
                apiError.response?.data?.error || "API request failed";
              return NextResponse.json(
                { error: errorMessage },
                {
                  status: statusCode,
                  headers: corsHeaders,
                },
              );
            }

            responseTime = Date.now() - startTime;
            return NextResponse.json(
              {
                response: apiResponse.data.content[0].text,
                model,
                responseTime,
              },
              {
                headers: corsHeaders,
              },
            );

          case "gemini-pro":
          case "gemini-2.0-flash-exp":
          case "gemini-1.5-pro":
          case "gemini-1.5-flash":
            // For Gemini models, only pass supported parameters
            const geminiConfig = {
              temperature: temperature,
              topP: topP,
              maxOutputTokens: maxTokens,
            };

            try {
              apiResponse = await axios.post(
                `${MODELS[model].apiEndpoint}?key=${apiKey}`,
                {
                  contents: [
                    ...messages.map((msg) => ({
                      role: msg.role,
                      parts: [{ text: msg.content }],
                    })),
                    { role: "user", parts: [{ text: prompt }] },
                  ],
                  generationConfig: geminiConfig,
                  safetySettings: [
                    {
                      category: "HARM_CATEGORY_HARASSMENT",
                      threshold: "BLOCK_MEDIUM_AND_ABOVE",
                    },
                    {
                      category: "HARM_CATEGORY_HATE_SPEECH",
                      threshold: "BLOCK_MEDIUM_AND_ABOVE",
                    },
                    {
                      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                      threshold: "BLOCK_MEDIUM_AND_ABOVE",
                    },
                    {
                      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                      threshold: "BLOCK_MEDIUM_AND_ABOVE",
                    },
                  ],
                },
              );
            } catch (apiError) {
              const statusCode = apiError.response?.status || 500;

              const errorMessage =
                apiError.response?.data?.error || "API request failed";

              logAPIError("ai_query", "ai_provider_error", apiError, {
                component: "query",
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
                {
                  status: statusCode,
                  headers: corsHeaders,
                },
              );
            }

            logAPIInfo("ai_query", "request_completed", {
              component: "query",
              duration: Date.now() - startTime,
              metadata: {
                chatId,
                model,
                status: "success",
                responseLength:
                  apiResponse.data.candidates[0].content.parts[0].text.length ||
                  0,
                tokensUsed: apiResponse.data?.tokens_used,
                responseTime: Date.now() - startTime,
              },
            });

            responseTime = Date.now() - startTime;
            return NextResponse.json(
              {
                response: apiResponse.data.candidates[0].content.parts[0].text,
                model,
                responseTime,
              },
              {
                headers: corsHeaders,
              },
            );

          default:
            logAPIError(
              "ai_query",
              "ai_provider_error",
              new Error("apiError"),
              {
                component: "query",
                duration: Date.now() - startTime,
                metadata: {
                  chatId,
                  model,
                  statusCode: 400,
                  errorMessage: `Unsupported model - ${model}`,
                  errorType: "ai_provider",
                },
              },
            );

            return NextResponse.json(
              { error: "Unsupported model" },
              {
                status: 400,
                headers: corsHeaders,
              },
            );
        }
      } catch (error) {
        logAPIError("ai_query", "unexpected_error", error, {
          component: "query",
          duration: 0,
          metadata: {
            chatId: requestBody?.chatId || "unknown",
            model: requestBody?.model,
            errorType: "unexpected",
            errorMessage: error.message,
          },
        });

        return NextResponse.json(
          { error: "Failed to process request due to an unexpected error" },
          {
            status: 500,
            headers: corsHeaders,
          },
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
}
