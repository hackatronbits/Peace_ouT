import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import https from "https";
import {
  logAPIError,
  logAPIInfo,
  logAPIWarning,
} from "../../../../../utils/apiLogger";

// Create HTTPS agent that accepts self-signed certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export async function GET(request: NextRequest) {
  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, x-ollama-url, x-ollama-mode",
      },
    });
  }

  const ollamaUrl = `${request.headers.get("x-ollama-url")}/api/${request.headers.get("x-ollama-mode")}`;

  try {
    await logAPIInfo("local_ollama_connector", "request_start", {
      component: "ai/ollama",
      action: "tags_request",
      metadata: {
        url: ollamaUrl,
        mode: request.headers.get("x-ollama-mode"),
      },
    });

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    const response = await axios.get(ollamaUrl, {
      headers,
      httpsAgent,
    });

    await logAPIInfo("local_ollama_connector", "request_complete", {
      component: "ai/ollama",
      action: "tags_request",
      status: "success",
      metadata: {
        url: ollamaUrl,
        mode: request.headers.get("x-ollama-mode"),
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    const status = axios.isAxiosError(error)
      ? error.response?.status || 500
      : 500;

    await logAPIError("local_ollama_connector", "request_error", error, {
      component: "ai/ollama",
      action: "tags_request",
    });

    return NextResponse.json(
      { error: "Failed to connect to Ollama server" },
      { status },
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, x-ollama-url, x-ollama-mode",
      },
    });
  }

  const body = await request.json();
  const ollamaUrl = `${request.headers.get("x-ollama-url")}/api/${request.headers.get("x-ollama-mode")}`;

  try {
    await logAPIInfo("local_ollama_connector", "request_start", {
      component: "ai/ollama",
      action: "process_request",
      metadata: {
        url: ollamaUrl,
        mode: request.headers.get("x-ollama-mode"),
      },
    });

    const response = await axios.post(ollamaUrl, body, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/x-ndjson",
      },
      httpsAgent,
      responseType: "stream",
    });

    return new Promise((resolve, reject) => {
      let fullMessage = "";
      let hasContent = false;
      let isDone = false;

      response.data.on("data", (chunk: Buffer) => {
        const text = chunk.toString("utf-8");
        const lines = text.split("\n");

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const parsed = JSON.parse(line);

            if (parsed.done) {
              isDone = true;
            }

            if (
              parsed.message?.role === "assistant" &&
              parsed.message?.content
            ) {
              const content = parsed.message.content;
              if (content.trim()) {
                hasContent = true;
                fullMessage += content;
              }
            } else if (parsed.response) {
              // Handle generate API response
              const content = parsed.response;
              if (content.trim()) {
                hasContent = true;
                fullMessage += content;
              }
            }
          } catch (e) {
            logAPIWarning("local_ollama_connector", "parse_error", {
              component: "ai/ollama",
              action: "parse_response",
              metadata: {
                error: e.message,
                line,
              },
            });
            continue;
          }
        }
      });

      response.data.on("end", async () => {
        const duration = Date.now() - startTime;

        if (!hasContent) {
          await logAPIWarning("local_ollama_connector", "no_content", {
            component: "ai/ollama",
            action: "process_response",
            duration,
            metadata: {
              isDone,
            },
          });

          resolve(
            NextResponse.json(
              { error: "No content received from Ollama" },
              {
                status: 500,
                headers: {
                  "Access-Control-Allow-Origin": "*",
                },
              },
            ),
          );
          return;
        }

        await logAPIInfo("local_ollama_connector", "request_complete", {
          component: "ai/ollama",
          action: "process_response",
          status: "success",
          duration,
          metadata: {
            responseLength: fullMessage.length,
            isDone,
          },
        });

        resolve(
          NextResponse.json(
            {
              message: {
                role: "assistant",
                content: fullMessage,
              },
            },
            {
              headers: {
                "Access-Control-Allow-Origin": "*",
              },
            },
          ),
        );
      });

      response.data.on("error", async (error: Error) => {
        await logAPIError("local_ollama_connector", "stream_error", error, {
          component: "ai/ollama",
          action: "process_stream",
          duration: Date.now() - startTime,
        });

        resolve(
          NextResponse.json(
            { error: "Error processing response" },
            {
              status: 500,
              headers: {
                "Access-Control-Allow-Origin": "*",
              },
            },
          ),
        );
      });
    });
  } catch (error) {
    await logAPIError("local_ollama_connector", "proxy_error", error as Error, {
      component: "ai/ollama",
      action: "proxy_request",
      duration: Date.now() - startTime,
      metadata: {
        url: ollamaUrl,
      },
    });

    return NextResponse.json(
      { error: "Failed to connect to Ollama server" },
      {
        status: axios.isAxiosError(error) ? error.response?.status || 500 : 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
}
