import { logAPIError, logAPIInfo } from "../../apiLogger";
import { queryAIModel } from "../shared/modelSelector";

interface AIAgentResponse {
  response: string | null;
  error: string | null;
  statusCode: number;
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

const PROMPT_TEMPLATES = {
  // Coding Assistance
  coding: (task: string) =>
    `As a senior developer, provide a detailed code solution for the following task. Include comments and best practices: ${task}`,
  // Troubleshooting
  troubleshooting: (error: string) =>
    `Analyze and provide a solution for the following error: ${error}`,
  // DevOps Support
  devOps: (task: string) =>
    `Provide a detailed DevOps solution for the following task: ${task}`,
  // API Integration
  api: (query: string) =>
    `Design an API integration solution for the following requirement: ${query}`,
  // Conceptual Help
  concept: (topic: string) =>
    `Explain the following technical concept in a clear and comprehensive way: ${topic}`,
  // Debugging
  debugging: (error: string) =>
    `Provide debugging guidance for the following issue: ${error}`,
  // Database Query
  database: (task: string) =>
    `Provide a database solution for the following requirement: ${task}`,
  // AI/ML Help
  aiMl: (task: string) =>
    `Provide assistance for the following AI/ML task: ${task}`,
  // Design Help
  design: (query: string) => `Provide system design advice for: ${query}`,
  // Security Help
  security: (query: string) =>
    `Provide security best practices for the following task: ${query}`,
  // Productivity
  productivity: (query: string) =>
    `Create an automation script for the following task: ${query}`,
  // Fallback
  fallback: (query: string) => `The user query was unclear: "${query}". 
  Provide a general response based on the following guidelines:
  - If the query is technical, suggest common technical tasks.
  - If it seems general, suggest resources or assistance you can provide.
  - Otherwise, politely ask the user to clarify their query.`,
} as const;

export const toolbox = {
  /**
   * Coding Assistance Tool
   */
  codingAssistance: async (
    task: string,
    requestedModel: string,
    apiKey: string,
    messages: Message[],
    chatId: string,
  ): Promise<AIAgentResponse> => {
    logAPIInfo("tech_agent", "coding_task_started", {
      component: "toolbox",
      metadata: {
        chatId,
        taskLength: task.length,
        model: requestedModel,
      },
    });

    if (!task) {
      logAPIError(
        "tech_agent",
        "validation_failed",
        new Error("Invalid task"),
        {
          component: "toolbox",
          metadata: {
            chatId,
            tool: "codingAssistance",
          },
        },
      );

      return {
        response: null,
        error: "Please provide a valid coding task.",
        statusCode: 400,
      };
    }
    const updatedMessages: Message[] = [
      ...messages,
      {
        role: "user",
        content: PROMPT_TEMPLATES.coding(task),
      },
    ];

    return await queryAIModel(
      PROMPT_TEMPLATES.coding(task),
      "coding",
      requestedModel,
      apiKey,
      updatedMessages,
      chatId,
    );
  },

  /**
   * Troubleshooting Tool
   */
  troubleshooting: async (
    error: string,
    requestedModel: string,
    apiKey: string,
    messages: Message[],
    chatId: string,
  ): Promise<AIAgentResponse> => {
    if (!error) {
      logAPIError(
        "tech_agent",
        "validation_failed",
        new Error("Invalid task"),
        {
          component: "toolbox",
          metadata: {
            chatId,
            tool: "troubleshooting",
          },
        },
      );

      return {
        response: null,
        error: "Please provide a valid error message.",
        statusCode: 400,
      };
    }
    const updatedMessages: Message[] = [
      ...messages,
      { role: "user", content: PROMPT_TEMPLATES.troubleshooting(error) },
    ];
    return await queryAIModel(
      PROMPT_TEMPLATES.troubleshooting(error),
      "troubleshooting",
      requestedModel,
      apiKey,
      updatedMessages,
      chatId,
    );
  },

  /**
   * DevOps Support Tool
   */
  devOpsSupport: async (
    task: string,
    requestedModel: string,
    apiKey: string,
    messages: Message[],
    chatId: string,
  ): Promise<AIAgentResponse> => {
    if (!task) {
      logAPIError(
        "tech_agent",
        "validation_failed",
        new Error("Invalid task"),
        {
          component: "toolbox",
          metadata: {
            chatId,
            tool: "devOpsSupport",
          },
        },
      );

      return {
        response: null,
        error: "Please specify the DevOps task you need help with.",
        statusCode: 400,
      };
    }
    const updatedMessages: Message[] = [
      ...messages,
      {
        role: "user",
        content: PROMPT_TEMPLATES.devOps(task),
      },
    ];
    return await queryAIModel(
      PROMPT_TEMPLATES.devOps(task),
      "devOps",
      requestedModel,
      apiKey,
      updatedMessages,
      chatId,
    );
  },

  /**
   * API Integration Tool
   */
  apiIntegration: async (
    query: string,
    requestedModel: string,
    apiKey: string,
    messages: Message[],
    chatId: string,
  ): Promise<AIAgentResponse> => {
    if (!query) {
      logAPIError(
        "tech_agent",
        "validation_failed",
        new Error("Invalid task"),
        {
          component: "toolbox",
          metadata: {
            chatId,
            tool: "apiIntegration",
          },
        },
      );

      return {
        response: null,
        error: "Please specify the API integration details.",
        statusCode: 400,
      };
    }
    const updatedMessages: Message[] = [
      ...messages,
      {
        role: "user",
        content: PROMPT_TEMPLATES.api(query),
      },
    ];
    return await queryAIModel(
      PROMPT_TEMPLATES.api(query),
      "api",
      requestedModel,
      apiKey,
      updatedMessages,
      chatId,
    );
  },

  /**
   * Conceptual Help Tool
   */
  conceptualHelp: async (
    topic: string,
    requestedModel: string,
    apiKey: string,
    messages: Message[],
    chatId: string,
  ): Promise<AIAgentResponse> => {
    if (!topic) {
      logAPIError(
        "tech_agent",
        "validation_failed",
        new Error("Invalid task"),
        {
          component: "toolbox",
          metadata: {
            chatId,
            tool: "conceptualHelp",
          },
        },
      );

      return {
        response: null,
        error: "Please provide a valid topic to explain.",
        statusCode: 400,
      };
    }
    const updatedMessages: Message[] = [
      ...messages,
      {
        role: "user",
        content: PROMPT_TEMPLATES.concept(topic),
      },
    ];
    return await queryAIModel(
      PROMPT_TEMPLATES.concept(topic),
      "concept",
      requestedModel,
      apiKey,
      updatedMessages,
      chatId,
    );
  },

  /**
   * Debugging Tool
   */
  debugging: async (
    error: string,
    requestedModel: string,
    apiKey: string,
    messages: Message[],
    chatId: string,
  ): Promise<AIAgentResponse> => {
    if (!error) {
      logAPIError(
        "tech_agent",
        "validation_failed",
        new Error("Invalid task"),
        {
          component: "toolbox",
          metadata: {
            chatId,
            tool: "debugging",
          },
        },
      );

      return {
        response: null,
        error: "Please provide a valid error to debug.",
        statusCode: 400,
      };
    }
    const updatedMessages: Message[] = [
      ...messages,
      { role: "user", content: PROMPT_TEMPLATES.debugging(error) },
    ];
    return await queryAIModel(
      PROMPT_TEMPLATES.debugging(error),
      "debugging",
      requestedModel,
      apiKey,
      updatedMessages,
      chatId,
    );
  },

  /**
   * Database Query Tool
   */
  databaseQuery: async (
    task: string,
    requestedModel: string,
    apiKey: string,
    messages: Message[],
    chatId: string,
  ): Promise<AIAgentResponse> => {
    if (!task) {
      logAPIError(
        "tech_agent",
        "validation_failed",
        new Error("Invalid task"),
        {
          component: "toolbox",
          metadata: {
            chatId,
            tool: "databaseQuery",
          },
        },
      );

      return {
        response: null,
        error: "Please provide a valid database task.",
        statusCode: 400,
      };
    }
    const updatedMessages: Message[] = [
      ...messages,
      {
        role: "user",
        content: PROMPT_TEMPLATES.database(task),
      },
    ];
    return await queryAIModel(
      PROMPT_TEMPLATES.database(task),
      "database",
      requestedModel,
      apiKey,
      updatedMessages,
      chatId,
    );
  },

  /**
   * AI/ML Help Tool
   */
  aiMlHelp: async (
    task: string,
    requestedModel: string,
    apiKey: string,
    messages: Message[],
    chatId: string,
  ): Promise<AIAgentResponse> => {
    if (!task) {
      logAPIError(
        "tech_agent",
        "validation_failed",
        new Error("Invalid task"),
        {
          component: "toolbox",
          metadata: {
            chatId,
            tool: "aiMlHelp",
          },
        },
      );

      return {
        response: null,
        error: "Please specify the AI/ML task.",
        statusCode: 400,
      };
    }
    const updatedMessages: Message[] = [
      ...messages,
      {
        role: "user",
        content: PROMPT_TEMPLATES.aiMl(task),
      },
    ];
    return await queryAIModel(
      PROMPT_TEMPLATES.aiMl(task),
      "aiMl",
      requestedModel,
      apiKey,
      updatedMessages,
      chatId,
    );
  },

  /**
   * Design Help Tool
   */
  designHelp: async (
    query: string,
    requestedModel: string,
    apiKey: string,
    messages: Message[],
    chatId: string,
  ): Promise<AIAgentResponse> => {
    if (!query) {
      logAPIError(
        "tech_agent",
        "validation_failed",
        new Error("Invalid task"),
        {
          component: "toolbox",
          metadata: {
            chatId,
            tool: "designHelp",
          },
        },
      );

      return {
        response: null,
        error: "Please provide details about the system design task.",
        statusCode: 400,
      };
    }
    const updatedMessages: Message[] = [
      ...messages,
      { role: "user", content: PROMPT_TEMPLATES.design(query) },
    ];
    return await queryAIModel(
      PROMPT_TEMPLATES.design(query),
      "design",
      requestedModel,
      apiKey,
      updatedMessages,
      chatId,
    );
  },

  /**
   * Security Help Tool
   */
  securityHelp: async (
    query: string,
    requestedModel: string,
    apiKey: string,
    messages: Message[],
    chatId: string,
  ): Promise<AIAgentResponse> => {
    if (!query) {
      logAPIError(
        "tech_agent",
        "validation_failed",
        new Error("Invalid task"),
        {
          component: "toolbox",
          metadata: {
            chatId,
            tool: "securityHelp",
          },
        },
      );

      return {
        response: null,
        error: "Please specify the security-related task.",
        statusCode: 400,
      };
    }
    const updatedMessages: Message[] = [
      ...messages,
      {
        role: "user",
        content: PROMPT_TEMPLATES.security(query),
      },
    ];
    return await queryAIModel(
      PROMPT_TEMPLATES.security(query),
      "security",
      requestedModel,
      apiKey,
      updatedMessages,
      chatId,
    );
  },

  /**
   * Productivity Tool
   */
  productivity: async (
    query: string,
    requestedModel: string,
    apiKey: string,
    messages: Message[],
    chatId: string,
  ): Promise<AIAgentResponse> => {
    if (!query) {
      logAPIError(
        "tech_agent",
        "validation_failed",
        new Error("Invalid task"),
        {
          component: "toolbox",
          metadata: {
            chatId,
            tool: "productivity",
          },
        },
      );

      return {
        response: null,
        error: "Please specify the automation task.",
        statusCode: 400,
      };
    }
    const updatedMessages: Message[] = [
      ...messages,
      {
        role: "user",
        content: PROMPT_TEMPLATES.productivity(query),
      },
    ];
    return await queryAIModel(
      PROMPT_TEMPLATES.productivity(query),
      "productivity",
      requestedModel,
      apiKey,
      updatedMessages,
      chatId,
    );
  },

  /**
   * Fallback Tool
   */
  fallback: async (
    query: string,
    requestedModel: string,
    apiKey: string,
    messages: Message[],
    chatId: string,
  ): Promise<AIAgentResponse> => {
    const updatedMessages: Message[] = [
      ...messages,
      { role: "user", content: PROMPT_TEMPLATES.fallback(query) },
    ];

    return await queryAIModel(
      PROMPT_TEMPLATES.fallback(query),
      "fallback",
      requestedModel,
      apiKey,
      updatedMessages,
      chatId,
    );
  },
};
