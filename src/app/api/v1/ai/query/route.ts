import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { logAPIError, logAPIInfo } from "../../../../../utils/apiLogger";
import { rateLimit } from "../../../../../config/rateLimit";
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
  maxOutput?: number;
  safeOutput?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  responseFormat?: string;
  customInstructions?: string;
  chatId: string;
}

// Model-specific API endpoints
export const MODEL_ENDPOINTS: Record<string, string> = {
  "gpt-4o-mini": "https://api.openai.com/v1/chat/completions",
  "gpt-4o": "https://api.openai.com/v1/chat/completions",
  "gpt-3.5-turbo-0125": "https://api.openai.com/v1/chat/completions",
  "claude-3-5-sonnet-20241022": "https://api.anthropic.com/v1/messages",
  "claude-3-5-haiku-20241022": "https://api.anthropic.com/v1/messages",
  "claude-3-opus-20240229": "https://api.anthropic.com/v1/messages",
  "gemini-pro":
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
  "gemini-2.0-flash-exp":
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent",
  "gemini-1.5-pro":
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent",
  "gemini-1.5-flash":
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
  "deepseek-chat": "https://api.deepseek.com/v1/chat/completions",
};

export async function POST(req: NextRequest) {
  let responseTime: number;
  let requestBody: Partial<ModelChatRequest> = {};

  return rateLimit("QUERY")(req, async (req) => {
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
          safeOutput,
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
          case "gpt-3.5-turbo-0125":
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
                  max_tokens: safeOutput,
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
                apiError.response?.data?.error?.message || "API request failed";

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
                responseTokens: apiResponse.data.usage.completion_tokens,
                responseTime: Date.now() - startTime,
              },
            });

            responseTime = Date.now() - startTime;
            return NextResponse.json(
              {
                response: apiResponse.data.choices[0].message.content,
                model: model,
                responseTokens: apiResponse.data.usage.completion_tokens,
                responseTime,
              },
              {
                headers: corsHeaders,
              },
            );

          case "claude-3-5-sonnet-20241022":
          case "claude-3-5-haiku-20241022":
          case "claude-3-opus-20240229":
            try {
              apiResponse = await axios.post(
                MODELS[model].apiEndpoint,
                {
                  model,
                  max_tokens: safeOutput,
                  temperature,
                  top_p: topP,
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
                responseTokens: apiResponse.data.usage.output_tokens,
                responseTime: Date.now() - startTime,
              },
            });

            responseTime = Date.now() - startTime;
            return NextResponse.json(
              {
                response: apiResponse.data.content[0].text,
                model,
                responseTime,
                responseTokens: apiResponse.data.usage.output_tokens,
              },
              {
                headers: corsHeaders,
              },
            );
          case "deepseek-chat":
            try {
              const requestData = {
                model: model,
                messages: [
                  ...messages,
                  {
                    role: "user",
                    content: prompt,
                  },
                ],
                temperature: temperature,
                max_tokens: safeOutput,
                top_p: topP,
                frequency_penalty: frequencyPenalty,
                presence_penalty: presencePenalty,
                stream: false,
              };

              const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
              };

              apiResponse = await axios.post(
                MODELS[model].apiEndpoint,
                requestData,
                {
                  headers,
                },
              );
            } catch (apiError) {
              const statusCode = apiError.response?.status || 500;
              console.log(apiError.response?.data?.error?.message);

              const errorMessage =
                apiError.response?.data?.error?.message || "API request failed";

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
                responseTokens: apiResponse.data.usage.completion_tokens,
                responseTime: Date.now() - startTime,
              },
            });

            responseTime = Date.now() - startTime;
            return NextResponse.json(
              {
                response: apiResponse.data.choices[0].message.content,
                model: model,
                responseTokens: apiResponse.data.usage.completion_tokens,
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
              maxOutputTokens: safeOutput,
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
                responseTokens:
                  apiResponse.data.usageMetadata.candidatesTokenCount,
                responseTime: Date.now() - startTime,
              },
            });

            responseTime = Date.now() - startTime;
            return NextResponse.json(
              {
                response: apiResponse.data.candidates[0].content.parts[0].text,
                model,
                responseTime,
                responseTokens:
                  apiResponse.data.usageMetadata.candidatesTokenCount,
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
  });
}
