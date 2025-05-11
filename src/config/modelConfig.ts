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
  supportsFineTuning: boolean;
  supportedFormats: string[];
  supportsImageGeneration?: boolean;
  imageGenerationEndpoint?: string;
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
  features?: ModelFeatures;
  pricing?: ModelPricing;
  keyAcquisitionLink?: string;
  defaultSettings: ModelSettings;
  description?: string;
  termsOfServiceUrl?: string;
  privacyPolicyUrl?: string;
  versions?: string[];
}

export const DEFAULT_MODEL_SETTINGS: ModelSettings = {
  temperature: 0.7,
  maxTokens: 2048,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  customInstructions: "",
};

export const MODELS: Record<string, ModelConfig> = {
  "gpt-4o-mini": {
    id: "gpt-4o-mini",
    name: "GPT-4o mini",
    provider: ModelProvider.OpenAI,
    apiEndpoint: "https://api.openai.com/v1/chat/completions",
    authMethod: "bearer",
    authHeaderName: "Authorization",
    description:
      "A smaller, cost-effective version of GPT-4o, offering advanced AI capabilities with reduced computational requirements. Ideal for routine tasks and rapid prototyping.",
    features: {
      maxTokens: 16384,
      supportsStreaming: true,
      multilingual: true,
      supportsFineTuning: true,
      supportedFormats: ["text", "markdown", "code"],
      supportsImageGeneration: false,
    },
    pricing: {
      inputTokenPrice: 0.00015,
      outputTokenPrice: 0.0006,
      currency: "USD",
    },
    keyAcquisitionLink: "https://platform.openai.com/api-keys",
    defaultSettings: { ...DEFAULT_MODEL_SETTINGS, maxTokens: 16384 },
    termsOfServiceUrl: "https://openai.com/policies/terms-of-use/",
    privacyPolicyUrl: "https://openai.com/policies/privacy-policy/",
  },
  "gpt-4o": {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: ModelProvider.OpenAI,
    apiEndpoint: "https://api.openai.com/v1/chat/completions",
    authMethod: "bearer",
    authHeaderName: "Authorization",
    description:
      "OpenAI's advanced multimodal AI model, capable of processing and generating text, images, and audio. Excels in complex reasoning and understanding tasks.",
    features: {
      maxTokens: 128000,
      supportsStreaming: true,
      multilingual: true,
      supportsFineTuning: true,
      supportedFormats: ["text", "markdown", "code", "image"],
      supportsImageGeneration: true,
      imageGenerationEndpoint: "https://api.openai.com/v1/images/generations",
    },
    pricing: {
      inputTokenPrice: 0.00375,
      outputTokenPrice: 0.015,
      currency: "USD",
    },
    keyAcquisitionLink: "https://platform.openai.com/api-keys",
    defaultSettings: { ...DEFAULT_MODEL_SETTINGS, maxTokens: 8192 },
    termsOfServiceUrl: "https://openai.com/policies/terms-of-use/",
    privacyPolicyUrl: "https://openai.com/policies/privacy-policy/",
  },
  "chatgpt-4o-latest": {
    id: "chatgpt-4o-latest",
    name: "ChatGPT-4o Latest",
    provider: ModelProvider.OpenAI,
    apiEndpoint: "https://api.openai.com/v1/chat/completions",
    authMethod: "bearer",
    authHeaderName: "Authorization",
    description:
      "The latest iteration of ChatGPT powered by GPT-4o, offering enhanced conversational abilities with multimodal input support.",
    features: {
      maxTokens: 128000,
      supportsStreaming: true,
      multilingual: true,
      supportsFineTuning: true,
      supportedFormats: ["text", "markdown", "code", "image"],
      supportsImageGeneration: true,
      imageGenerationEndpoint: "https://api.openai.com/v1/images/generations",
    },
    pricing: {
      inputTokenPrice: 0.00375,
      outputTokenPrice: 0.015,
      currency: "USD",
    },
    keyAcquisitionLink: "https://platform.openai.com/api-keys",
    defaultSettings: { ...DEFAULT_MODEL_SETTINGS, maxTokens: 8192 },
    termsOfServiceUrl: "https://openai.com/policies/terms-of-use/",
    privacyPolicyUrl: "https://openai.com/policies/privacy-policy/",
  },
  o1: {
    id: "o1",
    name: "o1",
    provider: ModelProvider.OpenAI,
    apiEndpoint: "https://api.openai.com/v1/chat/completions",
    authMethod: "bearer",
    authHeaderName: "Authorization",
    description:
      "OpenAI's reasoning model designed for complex problem-solving in domains like research, strategy, coding, math, and science.",
    features: {
      maxTokens: 8192,
      supportsStreaming: true,
      multilingual: true,
      supportsFineTuning: false,
      supportedFormats: ["text", "markdown", "code"],
      supportsImageGeneration: false,
    },
    pricing: {
      inputTokenPrice: 0.015,
      outputTokenPrice: 0.06,
      currency: "USD",
    },
    keyAcquisitionLink: "https://platform.openai.com/api-keys",
    defaultSettings: { ...DEFAULT_MODEL_SETTINGS, maxTokens: 4096 },
    termsOfServiceUrl: "https://openai.com/policies/terms-of-use/",
    privacyPolicyUrl: "https://openai.com/policies/privacy-policy/",
  },
  "o1-mini": {
    id: "o1-mini",
    name: "o1 Mini",
    provider: ModelProvider.OpenAI,
    apiEndpoint: "https://api.openai.com/v1/chat/completions",
    authMethod: "bearer",
    authHeaderName: "Authorization",
    description:
      "A smaller, faster, and more cost-effective version of the o1 model, particularly good at coding, math, and science tasks.",
    features: {
      maxTokens: 8192,
      supportsStreaming: true,
      multilingual: true,
      supportsFineTuning: false,
      supportedFormats: ["text", "markdown", "code"],
      supportsImageGeneration: false,
    },
    pricing: {
      inputTokenPrice: 0.003,
      outputTokenPrice: 0.012,
      currency: "USD",
    },
    keyAcquisitionLink: "https://platform.openai.com/api-keys",
    defaultSettings: { ...DEFAULT_MODEL_SETTINGS, maxTokens: 4096 },
    termsOfServiceUrl: "https://openai.com/policies/terms-of-use/",
    privacyPolicyUrl: "https://openai.com/policies/privacy-policy/",
  },
  "gpt-3.5-turbo-16k": {
    id: "gpt-3.5-turbo-16k",
    name: "GPT-3.5 Turbo 16k",
    provider: ModelProvider.OpenAI,
    apiEndpoint: "https://api.openai.com/v1/chat/completions",
    authMethod: "bearer",
    authHeaderName: "Authorization",
    description:
      "An enhanced version of GPT-3.5 Turbo with a larger context window, suitable for extended conversations and document processing.",
    features: {
      maxTokens: 16384,
      supportsStreaming: true,
      multilingual: true,
      supportsFineTuning: true,
      supportedFormats: ["text", "markdown", "code"],
      supportsImageGeneration: false,
    },
    pricing: {
      inputTokenPrice: 0.003,
      outputTokenPrice: 0.004,
      currency: "USD",
    },
    keyAcquisitionLink: "https://platform.openai.com/api-keys",
    defaultSettings: { ...DEFAULT_MODEL_SETTINGS, maxTokens: 8192 },
    termsOfServiceUrl: "https://openai.com/policies/terms-of-use/",
    privacyPolicyUrl: "https://openai.com/policies/privacy-policy/",
  },
  "gpt-3.5-turbo": {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: ModelProvider.OpenAI,
    apiEndpoint: "https://api.openai.com/v1/chat/completions",
    authMethod: "bearer",
    authHeaderName: "Authorization",
    description:
      "A fast and efficient language model ideal for general-purpose tasks, offering a balance between performance and cost.",
    features: {
      maxTokens: 4096,
      supportsStreaming: true,
      multilingual: true,
      supportsFineTuning: true,
      supportedFormats: ["text", "markdown", "code"],
      supportsImageGeneration: false,
    },
    pricing: {
      inputTokenPrice: 0.0015,
      outputTokenPrice: 0.002,
      currency: "USD",
    },
    keyAcquisitionLink: "https://platform.openai.com/api-keys",
    defaultSettings: { ...DEFAULT_MODEL_SETTINGS, maxTokens: 2048 },
    termsOfServiceUrl: "https://openai.com/policies/terms-of-use/",
    privacyPolicyUrl: "https://openai.com/policies/privacy-policy/",
  },
  "gemini-2.0-flash-exp": {
    id: "gemini-2.0-flash-exp",
    name: "Gemini 2.0 Flash Exp",
    provider: ModelProvider.Google,
    apiEndpoint:
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent",
    authMethod: "bearer",
    authHeaderName: "Authorization",
    description:
      "Experimental version of Gemini optimized for faster response times.",
    features: {
      maxTokens: 32768,
      supportsStreaming: true,
      multilingual: true,
      supportsFineTuning: false,
      supportedFormats: ["text", "markdown", "code", "image"],
      supportsImageGeneration: true,
      imageGenerationEndpoint:
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent",
    },
    pricing: {
      inputTokenPrice: 0.0005,
      outputTokenPrice: 0.001,
      currency: "USD",
    },
    keyAcquisitionLink: "https://makersuite.google.com/app/apikey",
    defaultSettings: { ...DEFAULT_MODEL_SETTINGS, maxTokens: 16384 },
    termsOfServiceUrl: "https://policies.google.com/terms",
    privacyPolicyUrl: "https://policies.google.com/privacy",
  },
  "gemini-1.5-pro": {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: ModelProvider.Google,
    apiEndpoint:
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent",
    authMethod: "bearer",
    authHeaderName: "Authorization",
    description:
      "Google's most capable model, with broad knowledge and advanced reasoning capabilities.",
    features: {
      maxTokens: 2000000,
      supportsStreaming: true,
      multilingual: true,
      supportsFineTuning: false,
      supportedFormats: ["text", "markdown", "code", "image"],
      supportsImageGeneration: false,
    },
    pricing: {
      inputTokenPrice: 0.0005,
      outputTokenPrice: 0.001,
      currency: "USD",
    },
    keyAcquisitionLink: "https://makersuite.google.com/app/apikey",
    defaultSettings: { ...DEFAULT_MODEL_SETTINGS, maxTokens: 1000000 },
    termsOfServiceUrl: "https://policies.google.com/terms",
    privacyPolicyUrl: "https://policies.google.com/privacy",
  },
  "gemini-1.5-flash": {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: ModelProvider.Google,
    apiEndpoint:
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent",
    authMethod: "bearer",
    authHeaderName: "Authorization",
    description: "Optimized version of Gemini 1.5 for faster response times.",
    features: {
      maxTokens: 1000000,
      supportsStreaming: true,
      multilingual: true,
      supportsFineTuning: true,
      supportedFormats: ["text", "markdown", "code", "image"],
      supportsImageGeneration: false,
    },
    pricing: {
      inputTokenPrice: 0.0005,
      outputTokenPrice: 0.001,
      currency: "USD",
    },
    keyAcquisitionLink: "https://makersuite.google.com/app/apikey",
    defaultSettings: { ...DEFAULT_MODEL_SETTINGS, maxTokens: 500000 },
    termsOfServiceUrl: "https://policies.google.com/terms",
    privacyPolicyUrl: "https://policies.google.com/privacy",
  },
};

// Utility functions for model management
export function getModelConfig(modelId: string): ModelConfig {
  const config = MODELS[modelId];
  if (!config) {
    //By default we will explicitly pass a model to avoid breakage
    return MODELS["gpt-4o-mini"];
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
  if (!key || typeof key !== "string") {
    console.error("Invalid API key format");
    return false;
  }

  const config = getModelConfig(modelId);
  if (!config) {
    console.error(`Model configuration not found for ${modelId}`);
    return false;
  }

  console.log(key.length);

  // Provider-specific key validation
  switch (config.provider) {
    case ModelProvider.OpenAI:
      // OpenAI keys start with 'sk-' and are typically 164 characters long
      return key.startsWith("sk-") && key.length === 164;

    case ModelProvider.Google:
      // Google (Gemini) keys start with 'AI' and are typically 39 characters long
      return key.startsWith("AI") && key.length === 39;

    case ModelProvider.Anthropic:
      // Anthropic keys start with 'sk-ant-' and are longer
      return key.startsWith("sk-ant-") && key.length >= 50;

    case ModelProvider.Mistral:
      // Mistral keys typically start with 'mis_' and have specific length
      return key.startsWith("mis_") && key.length >= 32;

    case ModelProvider.Ollama:
      // Ollama is typically local, so any non-empty key is valid
      return key.length > 0;

    default:
      console.warn(
        `No specific validation rules for provider ${config.provider}`,
      );
      return key.length > 0;
  }
}
