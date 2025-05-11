import { agentCore } from "./agentCore";
import { queryAIModel } from "../shared/modelSelector";
import { logAPIError, logAPIInfo } from "../../apiLogger";

interface AIAgentResponse {
  response: string | null;
  responseTime?: Number;
  responseTokens?: Number;
  error: string | null;
  statusCode: number;
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Main Research AI Agent logic.
 * Combines toolbox logic (agentCore) with AI model fallback.
 * @param query - User input query
 * @returns The result string from the toolbox or AI model
 */
export const aiAgent = async (
  query: string,
  requestedModel: string,
  apiKey: string,
  messages: Message[],
  chatId: string,
): Promise<AIAgentResponse> => {
  try {
    logAPIInfo("research_agent", "processing_started", {
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

    // Step 2: If toolbox fails or returns null, fallback to querying the AI model
    if (!resultFromToolbox || isFallbackResult(resultFromToolbox)) {
      logAPIInfo("research_agent", "fallback_triggered", {
        component: "aiAgent",
        metadata: {
          chatId,
          model: requestedModel,
          reason: "insufficient_toolbox_result",
        },
      });

      const aiResult = await queryAIModel(
        query,
        determineFallbackTaskType(query),
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

    logAPIInfo("research_agent", "processing_completed", {
      component: "aiAgent",
      metadata: {
        chatId,
        model: requestedModel,
        responseLength: resultFromToolbox.response?.length || 0,
      },
    });

    // Step 3: Return the toolbox result if valid
    return resultFromToolbox;
  } catch (error) {
    // Log the error with detailed context
    logAPIError("research_agent", "processing_failed", error as Error, {
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
 * Determines the task type for fallback scenarios.
 * This ensures the correct AI model behavior if the toolbox fails.
 * @param query - User query
 * @returns The inferred task type
 */
const determineFallbackTaskType = (
  query: string,
): "qa" | "summary" | "research" => {
  if (query.includes("?")) return "qa";
  if (query.length > 500 || query.toLowerCase().includes("summarize"))
    return "summary";
  return "research";
};
