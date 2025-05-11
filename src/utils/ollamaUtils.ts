import { ModelConfig, ModelProvider } from "../config/modelConfig";
import { isMacOS } from "./platformUtils";
import { logError, logInfo, logWarning } from "./logger";
import axios, { AxiosRequestConfig, RawAxiosRequestHeaders } from "axios";

export interface OllamaConnectionStatus {
  isConnected: boolean;
  error?: string;
  details?: string;
}

export interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

export interface OllamaError extends Error {
  code?: string;
  details?: string;
}

export class OllamaConnectionError extends Error implements OllamaError {
  code?: string;
  details?: string;

  constructor(message: string, code?: string, details?: string) {
    super(message);
    this.name = "OllamaConnectionError";
    this.code = code;
    this.details = details;
  }
}

const handleOllamaError = (error: any): OllamaError => {
  logError("ollama", "handle_error", error, {
    component: "OllamaUtils",
    action: "handleOllamaError",
  });

  if (error instanceof OllamaConnectionError) {
    return error;
  }

  if (error.message?.includes("Failed to fetch")) {
    return new OllamaConnectionError(
      "Unable to connect to your local Ollama server",
      "CONNECTION_ERROR",
      "Please ensure Ollama is running and CORS is configured correctly",
    );
  }

  return new OllamaConnectionError(
    error.message || "Unknown error occurred",
    "UNKNOWN_ERROR",
  );
};

const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeoutMs: number = 30000,
  ollamaMode: string,
): Promise<Response> => {
  try {
    // Create headers using RawAxiosRequestHeaders type
    const headers: RawAxiosRequestHeaders = {
      "Content-Type": "application/json",
    };

    headers["x-ollama-url"] =
      `${isMacOS() ? "https" : "http"}://localhost:11435`;
    headers["x-ollama-mode"] = ollamaMode;

    const axiosConfig: AxiosRequestConfig = {
      url,
      method: options.method || "GET",
      headers,
      timeout: timeoutMs,
      httpsAgent: new (require("https").Agent)({
        rejectUnauthorized: false,
      }),
    };

    if (options.body) {
      axiosConfig.data = JSON.parse(options.body as string);
    }

    const response = await axios(axiosConfig);
    return new Response(JSON.stringify(response.data), {
      status: response.status,
      headers: response.headers as HeadersInit,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        throw new OllamaConnectionError(
          "Unable to connect to your local Ollama server",
          "CONNECTION_TIMEOUT",
          `Request timed out after ${timeoutMs}ms`,
        );
      }
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Network error occurred",
      );
    }
    throw error;
  }
};

export const checkOllamaConnection = async (
  modelConfig: ModelConfig,
): Promise<OllamaConnectionStatus> => {
  logInfo("ollama", "check_connection_start", {
    component: "OllamaUtils",
    action: "checkOllamaConnection",
    metadata: { modelId: modelConfig.id },
  });

  if (
    modelConfig.provider !== ModelProvider.Ollama ||
    !modelConfig.ollamaConfig
  ) {
    logWarning("ollama", "invalid_config", {
      component: "OllamaUtils",
      action: "checkOllamaConnection",
      metadata: { provider: modelConfig.provider },
    });
    return {
      isConnected: false,
      error: "Not an Ollama model or no configuration found",
    };
  }

  try {
    // Then check if the specific model is available
    const modelName = modelConfig.id;
    const modelResponse = await fetchWithTimeout(
      `/api/v1/ai/ollama`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
      3000,
      "tags",
    );

    if (!modelResponse.ok) {
      throw new Error(`HTTP error! status: ${modelResponse.status}`);
    }

    const models = await modelResponse.json();
    let modelDigest = "";

    // Check if model exists in the list
    const modelExists = models.models?.some((model: any) => {
      modelDigest = model.digest;
      return model.name === modelName;
    });

    if (!modelExists) {
      logWarning("ollama", "model_not_installed", {
        component: "OllamaUtils",
        action: "checkOllamaConnection",
        metadata: { modelName },
      });
      return {
        isConnected: false,
        error: `Ollama is running but ${modelName} is not installed. Please run: ollama pull ${modelConfig.id}`,
      };
    }

    const keys = JSON.parse(localStorage.getItem("PC_modelApiKeys") || "{}");
    keys[modelConfig.id] = modelDigest;
    localStorage.setItem("PC_modelApiKeys", JSON.stringify(keys));

    logInfo("ollama", "connection_success", {
      component: "OllamaUtils",
      action: "checkOllamaConnection",
      metadata: { modelName, modelDigest },
    });

    return { isConnected: true };
  } catch (error: any) {
    const ollamaError = handleOllamaError(error);
    return {
      isConnected: false,
      error: ollamaError.message,
      details: ollamaError.details,
    };
  }
};

export const formatOllamaRequest = (
  messages: any[],
  modelConfig: ModelConfig,
) => {
  if (modelConfig.provider !== ModelProvider.Ollama) {
    throw new Error("Not an Ollama model");
  }

  // Filter out any empty or invalid messages
  const validMessages = messages.filter(
    (msg) => msg && msg.role && msg.content && msg.content.trim(),
  );

  const options = {
    ...(modelConfig.defaultSettings || {}),
    temperature: 0.7,
    top_p: 0.9,
  };

  // For single messages, use /api/generate endpoint format
  if (validMessages.length === 1) {
    return {
      model: modelConfig.id,
      prompt: validMessages[0].content.trim(),
      stream: true,
      options,
    };
  }

  // For chat history, use /api/chat endpoint format
  // Take only the last 10 messages to prevent high CPU usage
  const recentMessages = validMessages.slice(-10).map((msg) => ({
    role: msg.role === "user" ? "user" : "assistant",
    content: msg.content.trim(),
  }));

  return {
    model: modelConfig.id,
    messages: recentMessages,
    stream: true,
    options,
  };
};

export const streamOllamaResponse = async (
  modelConfig: ModelConfig,
  messages: any[],
  onChunk: (chunk: string) => void,
  onError: (error: OllamaError) => void,
  onComplete: () => void,
) => {
  logInfo("ollama", "stream_start", {
    component: "OllamaUtils",
    action: "streamOllamaResponse",
    metadata: {
      modelId: modelConfig.id,
      messageCount: messages.length,
    },
  });

  if (!modelConfig.ollamaConfig) {
    const error = new Error("No Ollama configuration found");
    logError("ollama", "no_config", error, {
      component: "OllamaUtils",
      action: "streamOllamaResponse",
    });
    onError(new OllamaConnectionError("No Ollama configuration found"));
    return;
  }

  const requestBody = formatOllamaRequest(messages, modelConfig);

  try {
    const response = await fetchWithTimeout(
      "/api/v1/ai/ollama",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      },
      40000,
      messages.length > 1 ? "chat" : "generate",
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    if (data.message?.content) {
      onChunk(data.message.content);

      logInfo("ollama", "response_complete", {
        component: "OllamaUtils",
        action: "streamOllamaResponse",
        metadata: {
          responseLength: data.message.content.length,
          modelId: modelConfig.id,
        },
      });
    } else {
      throw new Error("No content in response");
    }

    onComplete();
  } catch (error) {
    logError("ollama", "response_error", error as Error, {
      component: "OllamaUtils",
      action: "streamOllamaResponse",
      metadata: {
        modelId: modelConfig.id,
      },
    });
    onError(handleOllamaError(error));
  }
};
