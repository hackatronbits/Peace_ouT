import axios from "axios";
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
 * Query an AI model based on task type.
 * @param prompt - The prompt to send to the AI model.
 * @param taskType - The task type (e.g., "qa", "summary", "research", "coding", etc.).
 * @param requestedModel - The model selected by the user.
 * @param apiKey - The API key for authentication.
 * @returns The AI-generated response as a string.
 */
export const queryAIModel = async (
  prompt: string,
  taskType:
    | "qa"
    | "summary"
    | "research"
    | "searcher"
    | "coding"
    | "troubleshooting"
    | "devOps"
    | "api"
    | "concept"
    | "debugging"
    | "database"
    | "aiMl"
    | "design"
    | "security"
    | "productivity"
    | "fallback",
  requestedModel: string,
  apiKey: string,
  messages: Message[],
  chatId: string,
): Promise<AIAgentResponse> => {
  const model = selectModel(taskType, requestedModel);

  if (!apiKey) {
    console.error("Missing API key.");
    throw new Error("Missing API key. Please set the API key.");
  }

  try {
    logAPIInfo("model_selector", "query_started", {
      component: "modelSelector",
      metadata: {
        chatId,
        model: requestedModel,
        taskType,
        promptLength: prompt.length,
        messageCount: messages.length,
        temperature: getTemperature(taskType),
        maxTokens: getMaxTokens(taskType),
      },
    });

    // Get the base URL dynamically or use environment variable
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Use the full URL path
    const response = await axios.post(`${baseUrl}/api/v1/ai/query`, {
      model,
      apiKey,
      prompt,
      messages,
      temperature: getTemperature(taskType),
      maxTokens: getMaxTokens(taskType),
      chatId,
    });

    logAPIInfo("model_selector", "query_completed", {
      component: "modelSelector",
      metadata: {
        chatId,
        model: requestedModel,
        taskType,
        responseLength: response.data?.response?.length || 0,
        tokensUsed: response.data?.tokens_used,
        statusCode: response.status,
      },
    });

    return {
      response: response.data.response || null,
      error: null,
      statusCode: response.status,
    };
  } catch (error: any) {
    logAPIError("model_selector", "query_failed", error, {
      component: "modelSelector",
      metadata: {
        chatId,
        model: requestedModel,
        taskType,
        statusCode: error.response?.status,
        errorMessage: error.response?.data?.error || error.message,
        promptLength: prompt.length,
      },
    });

    if (axios.isAxiosError(error)) {
      return {
        response: null,
        error: error.response?.data?.error || "An unexpected error occurred.",
        statusCode: error.response?.status || 500,
      };
    }

    return {
      response: null,
      error: "An unexpected error occurred.",
      statusCode: 500,
    };
  }
};

/**
 * Selects the AI model based on the task type.
 * @param taskType - The task type.
 * @returns The model name to use.
 */
const selectModel = (taskType: string, selectedModel: string): string => {
  // Define task-to-model priorities
  const modelPriority: Record<string, string[]> = {
    coding: ["o1", "gpt-4o", "gpt-3.5-turbo"],
    debugging: ["o1", "gpt-4o", "gpt-3.5-turbo"],
    devOps: ["o1", "gpt-4o", "gpt-3.5-turbo"],
    qa: ["gpt-3.5-turbo", "gpt-4o", "gemini-2.0-flash-exp"],
    research: ["gpt-4o", "gemini-2.0-flash-exp", "gpt-3.5-turbo"],
    summary: ["gpt-3.5-turbo", "gpt-4o", "gemini-2.0-flash-exp"],
    aiMl: ["gemini-2.0-flash-exp", "gpt-4o", "claude-3.0"],
    concept: ["gemini-2.0-flash-exp", "gpt-4o", "gpt-3.5-turbo"],
    design: ["gemini-2.0-flash-exp", "gpt-4o", "claude-2.0"],
    security: ["chatgpt-4o-latest", "gpt-4o-mini", "gpt-3.5-turbo"],
    productivity: ["chatgpt-4o-latest", "gpt-4o-mini", "gpt-3.5-turbo"],
    writing: ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"],
    largeContext: ["gpt-3.5-turbo-16k", "gpt-4o", "gemini-1.5-pro"],
  };

  // Get prioritized models for the given task type
  const prioritizedModels = modelPriority[taskType] || ["gpt-3.5-turbo"]; // Default fallback

  // Include the user-selected model if provided
  if (selectedModel) {
    prioritizedModels.unshift(selectedModel); // Give priority to the client-selected model
  }

  // Return the first available model
  const selectedModelToUse = prioritizedModels[0];

  // If no suitable model is found, throw an error
  if (!selectedModelToUse) {
    throw new Error(
      `No suitable model available for task type '${taskType}'. Please check your model access.`,
    );
  }

  return selectedModelToUse;
};

/**
 * Adjusts the max tokens based on the task type.
 * @param taskType - The task type.
 * @returns The maximum number of tokens to use.
 */
const getMaxTokens = (taskType: string): number => {
  switch (taskType) {
    // Summary needs space for:
    // - Main findings
    // - Key methodologies
    // - Significant conclusions
    // - Important implications
    // - Core recommendations
    case "summary":
      return 1500;

    // Analysis needs space for:
    // - Key findings
    // - Critical analysis
    // - Supporting evidence
    // - Research implications
    // - Future directions
    case "analysis":
      return 2000;

    // Literature review needs space for:
    // - Overview of key research
    // - Multiple theoretical frameworks
    // - Methodological approaches
    // - Research gaps
    // - Synthesis of findings
    case "literature":
      return 2500;

    // Methodology needs space for:
    // - Research design details
    // - Data collection methods
    // - Analysis techniques
    // - Validity considerations
    // - Limitations and controls
    case "methodology":
      return 1800;

    // Synthesis needs space for:
    // - Integrated findings
    // - Common themes
    // - Contrasting viewpoints
    // - Unified conclusions
    // - Research implications
    case "synthesis":
      return 2200;

    // Trends analysis needs space for:
    // - Historical development
    // - Current state
    // - Emerging patterns
    // - Future projections
    // - Impact assessment
    case "trends":
      return 2000;

    // Conceptual explanations need room for examples
    case "concept":
      return 1000;

    // Code needs space for:
    // - Implementation
    // - Comments
    // - Usage examples
    // - Error handling
    case "coding":
      return 2000;

    // Debugging needs space for:
    // - Problem analysis
    // - Solution steps
    // - Code fixes
    // - Explanations
    case "debugging":
      return 1500;

    // DevOps often includes:
    // - Configuration examples
    // - Command sequences
    // - Best practices
    // - Security considerations
    case "devOps":
      return 2000;

    // Database responses include:
    // - SQL queries
    // - Schema designs
    // - Optimization tips
    case "database":
      return 1500;

    // AI/ML explanations need:
    // - Technical concepts
    // - Code examples
    // - Model architectures
    // - Parameters explanation
    case "aiMl":
      return 2000;

    // Design discussions include:
    // - Pattern explanations
    // - Trade-offs
    // - Best practices
    case "design":
      return 1200;

    // Fallback responses include:
    // - Clarifying questions
    // - Research suggestions
    // - Example topics
    // - Available tools
    case "fallback":
      return 1000;

    // Safe default for unknown types
    default:
      return 1500;
  }
};

/**
 * Adjusts the temperature based on the task type.
 * @param taskType - The task type.
 * @returns The temperature for the AI model.
 */
const getTemperature = (taskType: string): number => {
  switch (taskType) {
    // Tech Agent - High Precision Tasks
    case "coding":
    case "debugging":
    case "database":
    case "security":
      return 0.3; // Lower temperature for precise technical work

    // Research Agent - Analytical Tasks
    case "analysis":
    case "methodology":
    case "literature":
      return 0.3; // Lower temperature for rigorous research

    // Tech Agent - Technical Tasks
    case "troubleshooting":
    case "api":
    case "devOps":
      return 0.4; // Moderate-low for technical solutions

    // Research Agent - Structured Tasks
    case "synthesis":
    case "comparison":
    case "summarizer":
      return 0.4; // Moderate-low for research synthesis

    // Tech Agent - Conceptual Tasks
    case "concept":
    case "design":
    case "productivity":
      return 0.5; // Balanced for explanations and design

    // Research Agent - Exploratory Tasks
    case "trends":
      return 0.5; // Balanced for trend analysis

    // Tech Agent - AI/ML Tasks
    case "aiMl":
      return 0.6; // Slightly higher for AI/ML discussions

    // Fallback for both agents
    case "fallback":
      return 0.5; // Balanced default for general queries

    // Default Case
    default:
      return 0.4; // Conservative default
  }
};
