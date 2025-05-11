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
  summary: (query: string) => `Provide a comprehensive summary of:
${query}

Include:
1. Main research findings
2. Key methodologies used
3. Significant conclusions
4. Important implications
5. Core recommendations`,

  analysis: (task: string) => `Analyze the following research topic:
${task}

Provide:
1. Key findings and insights
2. Critical analysis of main points
3. Supporting evidence and data
4. Research implications
5. Potential future directions`,

  literatureReview: (query: string) => `Conduct a literature review on:
${query}

Include:
1. Overview of key research
2. Major theoretical frameworks
3. Methodological approaches
4. Research gaps identified
5. Synthesis of findings`,

  methodology: (task: string) => `Explain the research methodology for:
${task}

Cover:
1. Research design
2. Data collection methods
3. Analysis techniques
4. Validity considerations
5. Limitations and controls`,

  synthesis: (query: string) => `Synthesize the following research:
${query}

Provide:
1. Integrated findings
2. Common themes
3. Contrasting viewpoints
4. Unified conclusions
5. Research implications`,

  trends: (query: string) => `Analyze research trends in:
${query}

Include:
1. Historical development
2. Current state
3. Emerging patterns
4. Future projections
5. Impact assessment`,

  comparison: (query: string) => `Compare and analyze the following:
${query}

Provide a structured comparison including:
1. Key similarities and differences
2. Strengths and limitations of each
3. Contextual factors and considerations
4. Evidence-based evaluation
5. Recommendations based on comparison`,

  fallback: (query: string) => `Research query needs clarification: "${query}"

Response guidelines:
1. Maintain scholarly tone
2. Suggest research directions
3. Ask clarifying questions
4. Provide example topics
5. Mention available research tools`,
} as const;

export const toolbox = {
  /**
   * Summarizer Tool
   * Uses AI model to summarize a given text.
   */
  summarizer: async (
    text: string,
    requestedModel: string,
    apiKey: string,
    messages: Message[],
    chatId: string,
  ): Promise<AIAgentResponse> => {
    const updatedMessages: Message[] = [
      ...messages,
      {
        role: "user",
        content: PROMPT_TEMPLATES.summary(text),
      },
    ];
    return await queryAIModel(
      PROMPT_TEMPLATES.summary(text),
      "summary",
      requestedModel,
      apiKey,
      updatedMessages,
      chatId,
    );
  },

  /**
   * Analysis Tool
   * Placeholder for web search functionality (if the AI Model has web search, it might work).
   */
  analysis: async (
    query: string,
    requestedModel: string,
    apiKey: string,
    messages: Message[],
    chatId: string,
  ): Promise<AIAgentResponse> => {
    const updatedMessages: Message[] = [
      ...messages,
      {
        role: "user",
        content: PROMPT_TEMPLATES.analysis(query),
      },
    ];
    return await queryAIModel(
      PROMPT_TEMPLATES.analysis(query),
      "searcher",
      requestedModel,
      apiKey,
      updatedMessages,
      chatId,
    );
  },

  /**
   * Literature Review Tool
   * Uses AI model to answer a specific question concisely.
   */
  literatureReview: async (
    question: string,
    requestedModel: string,
    apiKey: string,
    messages: Message[],
    chatId: string,
  ): Promise<AIAgentResponse> => {
    const updatedMessages: Message[] = [
      ...messages,
      {
        role: "user",
        content: PROMPT_TEMPLATES.literatureReview(question),
      },
    ];
    return await queryAIModel(
      PROMPT_TEMPLATES.literatureReview(question),
      "qa",
      requestedModel,
      apiKey,
      updatedMessages,
      chatId,
    );
  },

  /**
   * Methodology Tool
   * Uses AI model to answer a specific question concisely.
   */
  methodology: async (
    question: string,
    requestedModel: string,
    apiKey: string,
    messages: Message[],
    chatId: string,
  ): Promise<AIAgentResponse> => {
    const updatedMessages: Message[] = [
      ...messages,
      {
        role: "user",
        content: PROMPT_TEMPLATES.methodology(question),
      },
    ];
    return await queryAIModel(
      PROMPT_TEMPLATES.methodology(question),
      "qa",
      requestedModel,
      apiKey,
      updatedMessages,
      chatId,
    );
  },

  /**
   * Synthesis Tool
   * Uses AI model to answer a specific question concisely.
   */
  synthesis: async (
    question: string,
    requestedModel: string,
    apiKey: string,
    messages: Message[],
    chatId: string,
  ): Promise<AIAgentResponse> => {
    const updatedMessages: Message[] = [
      ...messages,
      {
        role: "user",
        content: PROMPT_TEMPLATES.synthesis(question),
      },
    ];
    return await queryAIModel(
      PROMPT_TEMPLATES.synthesis(question),
      "qa",
      requestedModel,
      apiKey,
      updatedMessages,
      chatId,
    );
  },

  /**
   * Trends Tool
   * Uses AI model to answer a specific question concisely.
   */
  trends: async (
    question: string,
    requestedModel: string,
    apiKey: string,
    messages: Message[],
    chatId: string,
  ): Promise<AIAgentResponse> => {
    const updatedMessages: Message[] = [
      ...messages,
      {
        role: "user",
        content: PROMPT_TEMPLATES.trends(question),
      },
    ];
    return await queryAIModel(
      PROMPT_TEMPLATES.trends(question),
      "qa",
      requestedModel,
      apiKey,
      updatedMessages,
      chatId,
    );
  },

  /**
   * Comparison Tool
   * Uses AI model to answer a specific question concisely.
   */
  comparison: async (
    question: string,
    requestedModel: string,
    apiKey: string,
    messages: Message[],
    chatId: string,
  ): Promise<AIAgentResponse> => {
    const updatedMessages: Message[] = [
      ...messages,
      {
        role: "user",
        content: PROMPT_TEMPLATES.comparison(question),
      },
    ];
    return await queryAIModel(
      PROMPT_TEMPLATES.comparison(question),
      "qa",
      requestedModel,
      apiKey,
      updatedMessages,
      chatId,
    );
  },

  /**
   * Fallback Tool
   * Provides a user-friendly response for ambiguous or invalid queries.
   */
  fallback: async (
    query: string,
    requestedModel: string,
    apiKey: string,
    messages: Message[],
    chatId: string,
  ): Promise<AIAgentResponse> => {
    const fallbackPrompt = `The user query was unclear: "${query}". 
Provide a general response based on the following guidelines:
- If the query involves summarization, suggest ways to summarize content or offer an example.
- If the query relates to research, suggest common research topics or areas of exploration.
- If it appears to be a question, attempt to answer it concisely or request clarification.
- Otherwise, politely ask the user to refine their query for better assistance.`;
    const updatedMessages: Message[] = [
      ...messages,
      {
        role: "user",
        content: fallbackPrompt,
      },
    ];
    return await queryAIModel(
      fallbackPrompt,
      "fallback",
      requestedModel,
      apiKey,
      updatedMessages,
      chatId,
    );
  },
};
