import { agentCore } from "./agentCore";
import { queryAIModel } from "../shared/modelSelector";
import { logAPIError, logAPIInfo } from "../../apiLogger";

interface AIAgentResponse {
  response: string | null;
  error: string | null;
  statusCode: number;
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Main AI Agent logic.
 * Orchestrates toolbox tools and falls back to querying an AI model.
 * @param query - User's input query.
 * @param requestedModel - User's request model.
 * @param apiKey - API key for the AI service.
 * @param messages - Array of chat messages.
 * @param chatId - Current Chat ID.
 * @returns The response from the toolbox or AI model.
 */
export const aiAgent = async (
  query: string,
  requestedModel: string,
  apiKey: string,
  messages: Message[],
  chatId: string,
): Promise<AIAgentResponse> => {
  try {
    logAPIInfo("tech_agent", "processing_started", {
      component: "aiAgent",
      metadata: {
        chatId,
        model: requestedModel,
        queryLength: query.length,
      },
    });

    // Step 1: Use agentCore to determine and execute the correct tool
    const resultFromToolbox: AIAgentResponse = await agentCore(
      query,
      requestedModel,
      apiKey,
      messages,
      chatId,
    );

    // Step 2: Check if the toolbox result is valid; fallback if not
    if (!resultFromToolbox.response || isFallbackResult(resultFromToolbox)) {
      logAPIInfo("tech_agent", "fallback_triggered", {
        component: "aiAgent",
        metadata: {
          chatId,
          model: requestedModel,
          reason: "insufficient_toolbox_result",
        },
      });

      const aiResult = await queryAIModel(
        query,
        detectFallbackTaskType(query),
        requestedModel,
        apiKey,
        messages,
        chatId,
      );
      return {
        response: aiResult.response,
        error: aiResult.error,
        statusCode: aiResult.statusCode,
      };
    }

    logAPIInfo("tech_agent", "processing_completed", {
      component: "aiAgent",
      metadata: {
        chatId,
        model: requestedModel,
        responseLength: resultFromToolbox.response?.length || 0,
      },
    });

    // Step 3: Return the valid toolbox result
    return resultFromToolbox;
  } catch (error) {
    logAPIError("tech_agent", "processing_failed", error as Error, {
      component: "aiAgent",
      metadata: {
        chatId,
        model: requestedModel,
        errorType: error instanceof Error ? error.name : "unknown",
      },
    });

    return {
      response: null,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
      statusCode: 400,
    };
  }
};

/**
 * Helper to detect if the toolbox returned a fallback response.
 * @param result - The result from the toolbox.
 * @returns True if the result is a fallback response, false otherwise.
 */
const isFallbackResult = (result: AIAgentResponse): boolean => {
  return (
    !result.response ||
    (typeof result.response === "string" &&
      result.response.startsWith("I'm sorry")) ||
    result.response.trim() === ""
  );
};

/**
 * Detects the fallback task type for the AI model query.
 * @param query - The user's query.
 * @returns The inferred task type for fallback handling.
 */
const detectFallbackTaskType = (
  query: string,
): "qa" | "coding" | "research" | "troubleshooting" => {
  if (query.includes("?")) return "qa";
  if (
    query.toLowerCase().includes("code") ||
    query.toLowerCase().includes("programming")
  )
    return "coding";
  if (
    query.toLowerCase().includes("error") ||
    query.toLowerCase().includes("fix")
  )
    return "troubleshooting";
  return "research";
};
