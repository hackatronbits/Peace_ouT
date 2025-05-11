import { aiAgent } from "../../../../../../utils/agent/research/aiAgent";
import { NextRequest, NextResponse } from "next/server";
import { logAPIError, logAPIInfo } from "../../../../../../utils/apiLogger";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ScottAiAgentRequest {
  prompt: string;
  model: string;
  apiKey: string;
  messages: Message[];
  chatId: string;
}

/**
 * Handler for the Research AI Agent API.
 * Processes user queries by routing them to the Tech AI Agent.
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 */
export async function POST(req: NextRequest) {
    try {
      // Enable CORS
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      };

      // Handle preflight requests
      if (req.method === "OPTIONS") {
        return NextResponse.json(
          {},
          {
            headers: corsHeaders,
          },
        );
      }

      /// Validate request body
      const requestBody: ScottAiAgentRequest = await req.json();

      logAPIInfo("scott_agent", "request_started", {
        component: "research_agent",
        metadata: {
          chatId: requestBody.chatId,
          model: requestBody.model,
          messageCount: requestBody.messages.length,
        },
      });

      if (!requestBody || typeof requestBody.prompt !== "string") {
        logAPIError(
          "scott_agent",
          "validation_failed",
          new Error("Invalid prompt"),
          {
            component: "research_agent",
            metadata: {
              chatId: "chatId not available, requestBody empty",
              model: "model not available, requestBody empty",
              error: "Invalid or missing prompt",
            },
          },
        );

        return NextResponse.json(
          { error: "Invalid request. 'query' must be a non-empty string." },
          { status: 400, headers: corsHeaders },
        );
      }

      try {
        // Process the query using the Tech AI Agent
        const outcome = await aiAgent(
          requestBody.prompt,
          requestBody.model,
          requestBody.apiKey,
          requestBody.messages,
          requestBody.chatId,
        );

        if (outcome.error) {
          logAPIError("scott_agent", "agent_error", new Error(outcome.error), {
            component: "research_agent",
            metadata: {
              chatId: requestBody.chatId,
              model: requestBody.model,
              statusCode: outcome.statusCode,
              error: outcome.error,
            },
          });

          return NextResponse.json(
            { error: outcome.error },
            { status: outcome.statusCode, headers: corsHeaders },
          );
        }
        // Return the result from the AI agent
        logAPIInfo("scott_agent", "request_completed", {
          component: "research_agent",
          metadata: {
            chatId: requestBody.chatId,
            model: requestBody.model,
            responseLength: outcome.response?.length,
          },
        });

        return NextResponse.json(
          { response: outcome.response },
          { status: 200, headers: corsHeaders },
        );
      } catch (error) {
        // Log the error with context
        logAPIError("scott_agent", "unexpected_error", error, {
          component: "research_agent",
          metadata: {
            chatId: requestBody?.chatId || "unknown",
            model: requestBody?.model || "unknown",
            errorMessage: error.message,
            rawRequest:
              error.name === "SyntaxError"
                ? {
                    url: req.url,
                    method: req.method,
                    headers: Object.fromEntries(req.headers),
                  }
                : undefined,
          },
        });

        // Return a user-friendly error message
        return NextResponse.json(
          {
            error:
              "An error occurred while processing your query. Please try again later.",
          },
          { status: 500, headers: corsHeaders },
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
}
