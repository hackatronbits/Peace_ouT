import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

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
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  responseFormat?: string;
  customInstructions?: string;
}

// Model-specific API endpoints
const MODEL_ENDPOINTS: Record<string, string> = {
  "gpt-3.5-turbo": "https://api.openai.com/v1/chat/completions",
  "gemini-1.5":
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
};

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let responseTime: number;

  // Enable CORS
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return NextResponse.json(
      {},
      {
        headers: corsHeaders,
      },
    );
  }

  try {
    // Parse the request body
    const requestBody: ModelChatRequest = await req.json();
    console.log("Request Body:", requestBody);

    const {
      model,
      apiKey,
      prompt,
      messages = [],
      temperature,
      maxTokens,
      topP,
    } = requestBody;

    // Validate input
    if (!model || !apiKey || !prompt) {
      console.error("Validation Error: Missing required parameters");
      return NextResponse.json(
        { error: "Missing required parameters" },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    console.log("Model:", model);

    // Prepare API request based on the model
    let apiResponse;
    switch (model) {
      case "gpt-3.5-turbo":
        console.log("Calling OpenAI API for model:", model);
        apiResponse = await axios.post(
          MODEL_ENDPOINTS[model],
          {
            model: model,
            messages: [...messages, { role: "user", content: prompt }],
            max_tokens: 300,
            temperature: 0.7,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
          },
        );
        console.log("OpenAI API Response:", apiResponse.data);
        responseTime = Date.now() - startTime;
        return NextResponse.json(
          {
            response: apiResponse.data.choices[0].message.content,
            model: model,
            tokens_used: apiResponse.data.usage.total_tokens,
            responseTime,
          },
          {
            headers: corsHeaders,
          },
        );

     
      case "gemini-1.5":
        console.log("Calling Gemini API for model:", model);
        const geminiConfig = {
          temperature: temperature || 0.7,
          topP: topP || 1,
          maxOutputTokens: maxTokens || 2048,
        };

        apiResponse = await axios.post(
          `${MODEL_ENDPOINTS[model]}?key=${apiKey}`,
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
        console.log("Gemini API Response:", apiResponse.data);
        responseTime = Date.now() - startTime;
        return NextResponse.json(
          {
            response: apiResponse.data.candidates[0].content.parts[0].text,
            model: model,
            responseTime,
          },
          {
            headers: corsHeaders,
          },
        );

      default:
        console.error("Unsupported model:", model);
        return NextResponse.json(
          { error: "Unsupported model" },
          {
            status: 400,
            headers: corsHeaders,
          },
        );
    }
  } catch (error) {
    console.error("Model API Error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}
