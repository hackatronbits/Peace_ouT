// Enum for providers to ensure type safety
export enum ModelProvider {
  OpenAI = "openai",
  Google = "google",
  Anthropic = "anthropic",
  Ollama = "ollama",
  Mistral = "mistral",
  Deepseek = "deepseek",
}

// Authentication methods
export type AuthMethod = "bearer" | "apiKey" | "oauth" | "none";

// Model features interface
export interface ModelFeatures {
  maxTokens?: number;
  maxOutput: number;
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
  maxOutput: number;
  safeOutput?: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  customInstructions?: string;
}

// Ollama configuration interface
export interface OllamaConfig {
  endpoint: string;
  port: number;
  isConnected: boolean;
  useHttps?: boolean;
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
  ollamaConfig?: OllamaConfig;
}

export const DEFAULT_MODEL_SETTINGS: ModelSettings = {
  temperature: 0.7,
  maxTokens: 2048,
  maxOutput: 2000,
  safeOutput: 2000,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  customInstructions: "",
};

export const DEFAULT_OLLAMA_CONFIG: OllamaConfig = {
  endpoint: "localhost",
  port: 11435,
  isConnected: false,
  useHttps: false,
};

export const MODELS: Record<string, ModelConfig> = {
  "gpt-4o-mini": {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: ModelProvider.OpenAI,
    apiEndpoint: "https://api.openai.com/v1/chat/completions",
    authMethod: "bearer",
    authHeaderName: "Authorization",
    description:
      "GPT-4o Mini is a compact version of GPT-4o, optimized for lightweight tasks without sacrificing quality. It delivers fast responses and reliable performance, making it ideal for quick interactions and streamlined workflows. Despite its smaller footprint, GPT-4o Mini retains the core strengths of its larger counterpart, offering a balance of speed and accuracy for everyday use. It provides high-quality results for users who prioritize efficiency and simplicity, while minimizing resource consumption. With its versatility and reliability, GPT-4o Mini is perfect for both casual users and professionals on the go.",
    features: {
      maxTokens: 128000,
      maxOutput: 16384,
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
    defaultSettings: {
      ...DEFAULT_MODEL_SETTINGS,
      maxTokens: 128000,
      maxOutput: 16384,
      safeOutput: 8192,
    },
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
      "GPT-4o is a next-generation AI model offering advanced reasoning capabilities and unparalleled accuracy. Designed for a wide range of use cases, it excels in handling complex queries, delivering detailed explanations, and generating creative content. Its extended context capabilities make it ideal for long-form tasks while maintaining speed and efficiency. GPT-4o ensures a premium AI experience with enhanced precision and adaptability. It’s the perfect choice for users demanding robust and reliable AI solutions.",
    features: {
      maxTokens: 128000,
      maxOutput: 16384,
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
    defaultSettings: {
      ...DEFAULT_MODEL_SETTINGS,
      maxTokens: 128000,
      maxOutput: 16384,
      safeOutput: 8192,
    },
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
      "ChatGPT-4o Latest represents the pinnacle of conversational AI, combining advanced capabilities with the latest updates for unmatched accuracy and relevance. It’s designed for seamless interactions, delivering rich, context-aware responses in real-time. Ideal for professional and personal use, ChatGPT-4o Latest ensures a refined and dynamic conversational experience. With regular updates, it stays ahead of evolving user needs and expectations. Its versatility makes it suitable for everything from casual conversations to handling complex professional queries.",
    features: {
      maxTokens: 128000,
      maxOutput: 16384,
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
    defaultSettings: {
      ...DEFAULT_MODEL_SETTINGS,
      maxTokens: 128000,
      maxOutput: 16384,
      safeOutput: 8192,
    },
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
      "o1 is a powerful AI model tailored for efficient performance and high-quality outputs. It excels in handling a variety of tasks, from answering queries to generating creative content, with impressive precision. Designed for speed and adaptability, o1 balances power and performance, making it suitable for both casual users and professionals. Its streamlined architecture ensures consistent and reliable results. It’s a versatile model built for productivity and seamless integration.",
    features: {
      maxTokens: 200000,
      maxOutput: 100000,
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
    defaultSettings: {
      ...DEFAULT_MODEL_SETTINGS,
      maxTokens: 200000,
      maxOutput: 100000,
      safeOutput: 50000,
    },
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
      "o1-mini is a lightweight version of the o1 model, designed for speed and resource efficiency. It delivers quick and accurate responses, ideal for tasks that require a smaller compute footprint. While compact, o1-mini retains the key strengths of its full-sized counterpart, ensuring reliability and quality. It’s perfect for users who prioritize simplicity and performance on the go. o1-mini is designed for maximum efficiency with minimal resource usage.",
    features: {
      maxTokens: 128000,
      maxOutput: 65536,
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
    defaultSettings: {
      ...DEFAULT_MODEL_SETTINGS,
      maxTokens: 128000,
      maxOutput: 65536,
      safeOutput: 40000,
    },
    termsOfServiceUrl: "https://openai.com/policies/terms-of-use/",
    privacyPolicyUrl: "https://openai.com/policies/privacy-policy/",
  },
  "gpt-3.5-turbo-0125": {
    id: "gpt-3.5-turbo-0125",
    name: "GPT-3.5 Turbo",
    provider: ModelProvider.OpenAI,
    apiEndpoint: "https://api.openai.com/v1/chat/completions",
    authMethod: "bearer",
    authHeaderName: "Authorization",
    description:
      "GPT-3.5 Turbo 0125 is a powerful AI model known for its speed and cost-effectiveness. Built on the GPT-3.5 architecture, it offers consistent performance across conversational tasks, creative writing, and problem-solving. With optimized efficiency, it provides quick responses while maintaining robust contextual understanding. GPT-3.5 Turbo 0125 is a versatile solution for users seeking reliable AI interactions. Its affordability makes it an excellent option for budget-conscious applications.",
    features: {
      maxTokens: 16385,
      maxOutput: 4096,
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
    defaultSettings: {
      ...DEFAULT_MODEL_SETTINGS,
      maxTokens: 16385,
      maxOutput: 4096,
      safeOutput: 2048,
    },
    termsOfServiceUrl: "https://openai.com/policies/terms-of-use/",
    privacyPolicyUrl: "https://openai.com/policies/privacy-policy/",
  },
  "claude-3-5-sonnet-20241022": {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    provider: ModelProvider.Anthropic,
    apiEndpoint: "https://api.anthropic.com/v1/messages",
    authMethod: "apiKey",
    authHeaderName: "x-api-key",
    features: {
      maxTokens: 200000,
      maxOutput: 8192,
      supportsStreaming: true,
      multilingual: true,
      supportsFineTuning: false,
      supportedFormats: ["text", "images", "code", "markdown"],
    },
    pricing: {
      inputTokenPrice: 0.003,
      outputTokenPrice: 0.015,
      currency: "USD",
    },
    keyAcquisitionLink: "https://console.anthropic.com/settings/keys",
    defaultSettings: {
      ...DEFAULT_MODEL_SETTINGS,
      maxTokens: 200000,
      maxOutput: 8192,
      safeOutput: 4096,
    },
    description:
      "Claude-3.5 Sonnet (20241022) is an advanced conversational AI designed for in-depth dialogue and creative writing. Tailored for tasks requiring precision and context-awareness, it excels in providing thoughtful, detailed, and structured responses. With optimized processing capabilities, it handles complex queries efficiently and reliably. Claude-3.5 Sonnet is well-suited for professional environments, offering high-quality outputs for content creation and problem-solving.",
    termsOfServiceUrl: "https://www.anthropic.com/legal/consumer-terms",
    privacyPolicyUrl: "https://www.anthropic.com/legal/privacy",
  },
  "claude-3-5-haiku-20241022": {
    id: "claude-3-5-haiku-20241022",
    name: "Claude 3.5 Haiku",
    provider: ModelProvider.Anthropic,
    apiEndpoint: "https://api.anthropic.com/v1/messages",
    authMethod: "apiKey",
    authHeaderName: "x-api-key",
    features: {
      maxTokens: 200000,
      maxOutput: 8192,
      supportsStreaming: true,
      multilingual: true,
      supportsFineTuning: true,
      supportedFormats: ["text", "markdown", "code"],
      supportsImageGeneration: false,
    },
    pricing: {
      inputTokenPrice: 0.00025,
      outputTokenPrice: 0.00125,
      currency: "USD",
    },
    keyAcquisitionLink: "https://console.anthropic.com/settings/keys",
    defaultSettings: {
      ...DEFAULT_MODEL_SETTINGS,
      maxTokens: 200000,
      maxOutput: 8192,
      safeOutput: 4096,
    },
    description:
      "Claude-3.5 Haiku (20241022) is a lightweight and efficient AI model crafted for quick and concise interactions. Specially designed for tasks requiring brevity and clarity, it delivers precise and impactful responses in minimal time. Claude-3.5 Haiku is ideal for real-time conversations, quick content generation, and interactive applications. Despite its compact size, it retains Anthropic’s signature quality in maintaining contextual relevance and accuracy. It’s perfect for users seeking speed without compromising on performance.",
    termsOfServiceUrl: "https://www.anthropic.com/legal/consumer-terms",
    privacyPolicyUrl: "https://www.anthropic.com/legal/privacy",
  },
  "claude-3-opus-20240229": {
    id: "claude-3-opus-20240229",
    name: "Claude 3 Opus",
    provider: ModelProvider.Anthropic,
    apiEndpoint: "https://api.anthropic.com/v1/messages",
    authMethod: "apiKey",
    authHeaderName: "x-api-key",
    features: {
      maxTokens: 200000,
      maxOutput: 4096,
      supportsStreaming: true,
      multilingual: true,
      supportsFineTuning: false,
      supportedFormats: ["text", "images", "code", "markdown"],
    },
    pricing: {
      inputTokenPrice: 0.015,
      outputTokenPrice: 0.075,
      currency: "USD",
    },
    keyAcquisitionLink: "https://console.anthropic.com/settings/keys",
    defaultSettings: {
      ...DEFAULT_MODEL_SETTINGS,
      maxTokens: 200000,
      maxOutput: 4096,
      safeOutput: 2043,
    },
    description:
      "Claude-3 Opus (20240229) is a premium AI model designed for large-scale applications requiring exceptional accuracy and depth. With enhanced reasoning and contextual understanding, it handles complex prompts effortlessly, producing high-quality, detailed responses. Its extended token limit makes it suitable for long-form tasks such as document analysis, research, and creative projects. Claude-3 Opus offers an unparalleled balance of computational power and precision, making it a top-tier choice for demanding professional use cases.",
    termsOfServiceUrl: "https://www.anthropic.com/legal/consumer-terms",
    privacyPolicyUrl: "https://www.anthropic.com/legal/privacy",
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
      "Gemini 2.0 Flash Experimental is an innovative AI model that pushes the boundaries of speed and intelligence. Designed as a testbed for cutting-edge features, it offers experimental capabilities while maintaining impressive accuracy and performance. This model is ideal for users seeking to explore the latest advancements in AI, with optimized response times for fast-paced environments. Gemini 2.0 Flash Experimental is a glimpse into the future of AI technology.",
    features: {
      maxTokens: 1048576,
      maxOutput: 8192,
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
    defaultSettings: {
      ...DEFAULT_MODEL_SETTINGS,
      maxTokens: 1048576,
      maxOutput: 8192,
      safeOutput: 4096,
    },
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
      "Gemini 1.5 Pro is a highly advanced AI model built for precision and reliability in complex tasks. Tailored for in-depth analysis, nuanced content generation, and decision-making, it provides a rich, context-aware experience. Its robust architecture ensures optimal performance even with intricate prompts, making it a preferred choice for professional and enterprise-level applications. Gemini 1.5 Pro balances power and flexibility to cater to demanding user needs.",
    features: {
      maxTokens: 2097152,
      maxOutput: 8192,
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
    defaultSettings: {
      ...DEFAULT_MODEL_SETTINGS,
      maxTokens: 2097152,
      maxOutput: 8192,
      safeOutput: 4096,
    },
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
    description:
      "Gemini 1.5 Flash is a cutting-edge AI model designed for lightning-fast responses without compromising on accuracy. Built for versatility, it excels in dynamic conversations, creative tasks, and problem-solving with remarkable efficiency. Its optimized architecture ensures seamless performance across a wide range of use cases, making it ideal for both real-time interactions and detailed outputs. Gemini 1.5 Flash combines speed and intelligence to deliver an exceptional user experience.",
    features: {
      maxTokens: 1048576,
      maxOutput: 8192,
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
    defaultSettings: {
      ...DEFAULT_MODEL_SETTINGS,
      maxTokens: 1048576,
      maxOutput: 8192,
      safeOutput: 4096,
    },
    termsOfServiceUrl: "https://policies.google.com/terms",
    privacyPolicyUrl: "https://policies.google.com/privacy",
  },
  "deepseek-chat": {
    id: "deepseek-chat",
    name: "DeepSeek V3",
    provider: ModelProvider.Deepseek,
    apiEndpoint: "https://api.deepseek.com/v1/chat/completions",
    authMethod: "bearer",
    authHeaderName: "Authorization",
    description:
      "DeepSeek Chat (DeepSeek v3) is a state-of-the-art conversational AI built for deep contextual understanding and advanced problem-solving. Designed to provide accurate, relevant, and well-structured responses, it excels in handling diverse and complex tasks. Its robust architecture ensures seamless interactions across professional, research, and personal applications. DeepSeek Chat adapts dynamically to input queries, delivering insightful answers with exceptional clarity and efficiency.",
    features: {
      maxTokens: 64000,
      maxOutput: 8000,
      supportsStreaming: true,
      multilingual: true,
      supportsFineTuning: false,
      supportedFormats: ["text", "markdown", "code"],
      supportsImageGeneration: false,
    },
    pricing: {
      inputTokenPrice: 0.0002,
      outputTokenPrice: 0.0002,
      currency: "USD",
    },
    keyAcquisitionLink: "https://platform.deepseek.com/api-keys",
    defaultSettings: {
      ...DEFAULT_MODEL_SETTINGS,
      maxTokens: 64000,
      maxOutput: 8000,
      safeOutput: 4000,
    },
    termsOfServiceUrl: "https://platform.deepseek.com/terms",
    privacyPolicyUrl: "https://platform.deepseek.com/privacy",
  },
  "mistral:latest": {
    id: "mistral:latest",
    name: "Mistral (Latest)",
    provider: ModelProvider.Ollama,
    apiEndpoint: "http://localhost:11434/api/chat",
    authMethod: "none",
    authHeaderName: "",
    description:
      "Ollama’s mistral:latest is a high-performance local AI model designed for fast and efficient processing. With a context length of up to 32,768 tokens, it supports detailed conversations and complex prompts. Optimized for local use, it ensures complete data privacy while delivering accurate and context-aware outputs. Mistral’s lightweight design makes it a versatile choice for a wide range of tasks, from creative writing to technical analysis. It combines speed, precision, and privacy for unparalleled user satisfaction.",
    features: {
      maxTokens: 16384,
      maxOutput: 16384,
      supportsStreaming: true,
      multilingual: true,
      supportsFineTuning: false,
      supportedFormats: ["text"],
    },
    defaultSettings: {
      ...DEFAULT_MODEL_SETTINGS,
      temperature: 0.7,
      maxTokens: 16384,
      maxOutput: 16384,
      safeOutput: 8194,
    },
    ollamaConfig: {
      endpoint: "localhost",
      port: 11435,
      isConnected: false,
      useHttps: false,
    },
    termsOfServiceUrl:
      "https://ollama.com/library/mistral:latest/blobs/9bac90050d38",
    privacyPolicyUrl: "https://mistral.ai/terms/#privacy-policy",
  },
  "mixtral:8x7b": {
    id: "mixtral:8x7b",
    name: "Mixtral (8x7b)",
    provider: ModelProvider.Ollama,
    apiEndpoint: "http://localhost:11434/api/chat",
    authMethod: "none",
    authHeaderName: "",
    description:
      "Ollama’s mixtral:8x7b combines the best of multiple architectures, including Mistral and LLaMA, to deliver exceptional accuracy and performance. With a context length of 32,768 tokens, it excels in handling intricate queries and generating detailed outputs. Its hybrid design ensures enhanced contextual understanding and adaptability, making it suitable for both personal and professional use. Optimized for local environments, Mixtral prioritizes data security and high-speed processing. It’s a cutting-edge model designed for versatility and efficiency.",
    features: {
      maxTokens: 16384,
      maxOutput: 16384,
      supportsStreaming: true,
      multilingual: true,
      supportsFineTuning: false,
      supportedFormats: ["text"],
    },
    defaultSettings: {
      ...DEFAULT_MODEL_SETTINGS,
      temperature: 0.7,
      maxTokens: 16384,
      maxOutput: 16384,
      safeOutput: 8194,
    },
    ollamaConfig: {
      endpoint: "localhost",
      port: 11435,
      isConnected: false,
      useHttps: false,
    },
    termsOfServiceUrl:
      "https://ollama.com/library/mixtral:8x7b:latest/blobs/9bac90050d38",
    privacyPolicyUrl: "https://mistral.ai/terms/#privacy-policy",
  },
  "gemma2:9b": {
    id: "gemma2:9b",
    name: "Gemma 2 (9b)",
    provider: ModelProvider.Ollama,
    apiEndpoint: "http://localhost:11434/api/chat",
    authMethod: "none",
    authHeaderName: "",
    description:
      "Ollama’s gemma2:9b is a highly capable local AI model built for advanced content generation and contextual reasoning. With its 9 billion parameter architecture, it provides detailed, accurate, and nuanced responses across a variety of applications. Supporting a context length of 32,768 tokens, it is ideal for long-form content, research, and in-depth conversations. Gemma2 combines robust performance with the privacy benefits of local deployment, ensuring a secure and seamless experience. It’s perfect for demanding use cases requiring both depth and precision.",
    features: {
      maxTokens: 4096,
      maxOutput: 4096,
      supportsStreaming: true,
      multilingual: true,
      supportsFineTuning: false,
      supportedFormats: ["text"],
    },
    defaultSettings: {
      ...DEFAULT_MODEL_SETTINGS,
      temperature: 0.7,
      maxTokens: 4096,
      maxOutput: 4096,
      safeOutput: 2048,
    },
    ollamaConfig: {
      endpoint: "localhost",
      port: 11435,
      isConnected: false,
      useHttps: false,
    },
    termsOfServiceUrl:
      "https://ollama.com/library/gemma2:9b:latest/blobs/9bac90050d38",
    privacyPolicyUrl: "https://ai.google.dev/gemma/terms",
  },
  "llama2:7b": {
    id: "llama2:7b",
    name: "Llama 2 (7B)",
    provider: ModelProvider.Ollama,
    apiEndpoint: "http://localhost:11434/api/chat",
    authMethod: "none",
    authHeaderName: "",
    description:
      "Ollama’s LLaMA2:7b is a versatile and efficient local AI model, offering fast and reliable responses for a wide range of tasks. With 7 billion parameters, it delivers robust performance for content creation, conversational AI, and analytical applications. Its support for a 32,768-token context length ensures it can handle both short interactions and lengthy prompts with ease. LLaMA2 is optimized for local use, maintaining full data privacy while providing high-quality outputs. It’s a reliable choice for users seeking an accessible yet powerful AI solution.",
    features: {
      maxTokens: 65536,
      maxOutput: 65536,
      supportsStreaming: true,
      multilingual: true,
      supportsFineTuning: false,
      supportedFormats: ["text"],
    },
    defaultSettings: {
      temperature: 0.7,
      maxTokens: 65536,
      maxOutput: 65536,
      safeOutput: 32768,
      topP: 0.9,
      frequencyPenalty: 0,
      presencePenalty: 0,
    },
    ollamaConfig: {
      endpoint: "localhost",
      port: 11435,
      isConnected: false,
      useHttps: false,
    },
    termsOfServiceUrl: "https://ai.meta.com/llama/license/",
    privacyPolicyUrl: "https://ai.meta.com/llama/license/",
  },
  "llama3.3:latest": {
    id: "llama3.3:latest",
    name: "Llama 3.3 (Latest)",
    provider: ModelProvider.Ollama,
    apiEndpoint: "http://localhost:11434/api/chat",
    authMethod: "none",
    authHeaderName: "",
    description:
      "Ollama’s LLaMA3.3:latest represents the latest evolution in local AI technology, combining cutting-edge advancements in speed, accuracy, and contextual understanding. Built with 3.3 billion parameters, it offers an efficient and scalable solution for both lightweight and complex tasks. Its extended 32,768-token context length enables seamless handling of detailed prompts and long-form outputs. Designed for local environments, LLaMA3.3 ensures data privacy and delivers high-performance results across creative, technical, and conversational use cases.",
    features: {
      maxTokens: 65536,
      maxOutput: 65536,
      supportsStreaming: true,
      multilingual: true,
      supportsFineTuning: false,
      supportedFormats: ["text"],
    },
    defaultSettings: {
      temperature: 0.7,
      maxTokens: 65536,
      maxOutput: 65536,
      safeOutput: 32768,
      topP: 0,
      frequencyPenalty: 0,
      presencePenalty: 0,
    },
    ollamaConfig: {
      endpoint: "localhost",
      port: 11435,
      isConnected: false,
      useHttps: false,
    },
    termsOfServiceUrl: "https://ollama.com/library/llama3.3/blobs/53a87df39647",
    privacyPolicyUrl: "https://ollama.com/library/llama3.3/blobs/bc371a43ce90",
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

    case ModelProvider.Deepseek:
      // Deepseek keys typically start with 'ds-' and have specific length
      return key.startsWith("sk-") && key.length >= 32;

    default:
      console.warn(
        `No specific validation rules for provider ${config.provider}`,
      );
      return key.length > 0;
  }
}
