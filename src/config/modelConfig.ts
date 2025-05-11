// Enum for providers to ensure type safety
export enum ModelProvider {
  OpenAI = "openai",
  Google = "google",
  Anthropic = "anthropic",
  Ollama = "ollama",
  Mistral = "mistral",
}

// Authentication methods
export type AuthMethod = "bearer" | "apiKey" | "oauth" | "none";

// Model features interface
export interface ModelFeatures {
  maxTokens?: number;
  supportsStreaming?: boolean;
  multilingual?: boolean;
}

// Pricing interface
export interface ModelPricing {
  inputTokenPrice?: number;
  outputTokenPrice?: number;
  currency?: string;
}

// Model settings interface
export interface ModelSettings {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  responseFormat?: "text" | "json" | "markdown";
  customInstructions?: string;
}

// Model configuration interface
export interface ModelConfig {
  id: string;
  name: string;
  provider: ModelProvider;
  apiEndpoint: string;
  authMethod: AuthMethod;
  authHeaderName: string;
  validationEndpoint: string;
  features?: ModelFeatures;
  pricing?: ModelPricing;
  keyAcquisitionLink?: string;
  defaultSettings: ModelSettings;
  description?: string;
  versions?: string[];
}

export const DEFAULT_MODEL_SETTINGS: ModelSettings = {
  temperature: 0.7,
  maxTokens: 2048,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  responseFormat: "text",
  customInstructions: "",
};

export const MODELS: Record<string, ModelConfig> = {
  "gpt-4": {
    id: "gpt-4",
    name: "GPT-4",
    provider: ModelProvider.OpenAI,
    apiEndpoint: "https://api.openai.com/v1/chat/completions",
    authMethod: "bearer",
    authHeaderName: "Authorization",
    validationEndpoint: "https://api.openai.com/v1/models",
    description: "Most capable GPT-4 model, better at complex tasks",
    versions: ["gpt-4", "gpt-4-32k"],
    features: {
      maxTokens: 8192,
      supportsStreaming: true,
      multilingual: true,
    },
    pricing: {
      inputTokenPrice: 0.03,
      outputTokenPrice: 0.06,
      currency: "USD",
    },
    keyAcquisitionLink: "https://platform.openai.com/api-keys",
    defaultSettings: { ...DEFAULT_MODEL_SETTINGS, maxTokens: 8192 },
  },
  "gpt-3.5-turbo": {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: ModelProvider.OpenAI,
    apiEndpoint: "https://api.openai.com/v1/chat/completions",
    authMethod: "bearer",
    authHeaderName: "Authorization",
    validationEndpoint: "https://api.openai.com/v1/models",
    description: "Fast and efficient for most tasks",
    versions: ["gpt-3.5-turbo", "gpt-3.5-turbo-16k"],
    features: {
      maxTokens: 4096,
      supportsStreaming: true,
      multilingual: true,
    },
    pricing: {
      inputTokenPrice: 0.0015,
      outputTokenPrice: 0.002,
      currency: "USD",
    },
    keyAcquisitionLink: "https://platform.openai.com/api-keys",
    defaultSettings: { ...DEFAULT_MODEL_SETTINGS, maxTokens: 4096 },
  },
  // "claude-2": {
  //   id: "claude-2",
  //   name: "Claude 2",
  //   provider: ModelProvider.Anthropic,
  //   apiEndpoint: "https://api.anthropic.com/v1/complete",
  //   authMethod: "bearer",
  //   authHeaderName: "x-api-key",
  //   validationEndpoint: "https://api.anthropic.com/v1/models",
  //   description: "Anthropic's most capable model, excels at analysis and coding",
  //   versions: ["claude-2", "claude-2.1"],
  //   features: {
  //     maxTokens: 100000,
  //     supportsStreaming: true,
  //     multilingual: true,
  //   },
  //   keyAcquisitionLink: "https://www.anthropic.com/product",
  //   defaultSettings: { ...DEFAULT_MODEL_SETTINGS, maxTokens: 100000 },
  // },
  "gemini-pro": {
    id: "gemini-pro",
    name: "Gemini Pro",
    provider: ModelProvider.Google,
    apiEndpoint:
      "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent",
    authMethod: "bearer",
    authHeaderName: "Authorization",
    validationEndpoint: "https://generativelanguage.googleapis.com/v1/models",
    description: "Google's advanced model with strong reasoning capabilities",
    versions: ["gemini-pro"],
    features: {
      maxTokens: 8192,
      supportsStreaming: true,
      multilingual: true,
    },
    pricing: {
      inputTokenPrice: 0.001,
      outputTokenPrice: 0.002,
      currency: "USD",
    },
    keyAcquisitionLink: "https://makersuite.google.com/app/apikey",
    defaultSettings: { ...DEFAULT_MODEL_SETTINGS, maxTokens: 8192 },
  },
  "gemini-1.5": {
    id: "gemini-1.5",
    name: "Gemini 1.5",
    provider: ModelProvider.Google,
    apiEndpoint:
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5:generateContent",
    authMethod: "bearer",
    authHeaderName: "Authorization",
    validationEndpoint: "https://generativelanguage.googleapis.com/v1/models",
    description:
      "Google's latest and most capable model with enhanced reasoning and improved performance",
    versions: ["gemini-1.5"],
    features: {
      maxTokens: 32768,
      supportsStreaming: true,
      multilingual: true,
    },
    pricing: {
      inputTokenPrice: 0.0005,
      outputTokenPrice: 0.001,
      currency: "USD",
    },
    keyAcquisitionLink: "https://makersuite.google.com/app/apikey",
    defaultSettings: { ...DEFAULT_MODEL_SETTINGS, maxTokens: 32768 },
  },
  // "ollama-local": {
  //   id: "ollama-local",
  //   name: "Ollama Local",
  //   provider: ModelProvider.Ollama,
  //   apiEndpoint: "http://localhost:11434/api/generate",
  //   authMethod: "none",
  //   authHeaderName: "",
  //   validationEndpoint: "http://localhost:11434/api/tags",
  //   description: "Run models locally with Ollama",
  //   versions: ["llama2", "codellama", "mistral"],
  //   features: {
  //     maxTokens: 4096,
  //     supportsStreaming: true,
  //     multilingual: true,
  //   },
  //   pricing: {
  //     inputTokenPrice: 0,
  //     outputTokenPrice: 0,
  //     currency: "N/A",
  //   },
  //   keyAcquisitionLink: undefined,
  //   defaultSettings: { ...DEFAULT_MODEL_SETTINGS, maxTokens: 4096 },
  // },
};

// Utility functions for model management
export function getModelConfig(modelId: string): ModelConfig {
  const config = MODELS[modelId];
  if (!config) {
    throw new Error(`No configuration found for model: ${modelId}`);
  }
  return config;
}

export function getAllModelConfigs(): ModelConfig[] {
  return Object.values(MODELS);
}

export function getModelsByProvider(provider: ModelProvider): ModelConfig[] {
  return Object.values(MODELS).filter((model) => model.provider === provider);
}

export function formatModelName(modelId: string): string {
  const config = getModelConfig(modelId);
  return config.name;
}

export async function validateModelApiKey(
  modelId: string,
  key: string,
): Promise<boolean> {
  // Always validate key length and non-empty
  if (!key || key.trim().length === 0) {
    return false;
  }

  // In development, allow any non-empty key
  if (process.env.NODE_ENV === "development") {
    console.warn("⚠️ API key validation bypassed in development mode");
    return true;
  }

  const config = getModelConfig(modelId);

  try {
    const response = await fetch(config.validationEndpoint, {
      method: "GET",
      headers:
        config.authMethod === "bearer"
          ? {
              Authorization: `Bearer ${key}`,
              "Content-Type": "application/json",
            }
          : config.authMethod === "apiKey"
            ? {
                [config.authHeaderName]: key,
                "Content-Type": "application/json",
              }
            : {},
    });

    // Custom validation logic based on provider
    switch (config.provider) {
      case ModelProvider.OpenAI:
        return response.status === 200;
      case ModelProvider.Google:
        const googleData = await response.json();
        return googleData && googleData.models;
      case ModelProvider.Anthropic:
        return response.status === 200;
      case ModelProvider.Ollama:
        const ollamaData = await response.json();
        return Array.isArray(ollamaData.models);
      default:
        return response.status === 200;
    }
  } catch (error) {
    console.error(`Error validating API key for ${modelId}:`, error);
    return false;
  }
}
