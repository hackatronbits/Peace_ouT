import React, { useState, useRef, useEffect, useCallback } from "react";
import { App, Button, Input, Tooltip } from "antd";
import { useApp } from "../../context/AppContext";
import MessageAvatar from "./ChatFormat/MessageAvatar";
import ApiKeyModal from "./KeyManagement/ApiKeyModal";
import SuggestionBubbles from "./StartSuggestion/SuggestionBubbles";
import "./ChatInterface.css";
import axios from "axios";
import { logInfo, logError, logWarning } from "../../utils/logger";
import FormattedMessage from "./ChatFormat/FormattedMessage";
import "./ChatFormat/FormattedMessage.css";
import { ThinkingIndicator } from "./ChatFormat/ThinkingIndicator";
import { ListMessages } from "./ChatFormat/ListMessages";
import { Disclaimer } from "./ChatFormat/Disclaimer";
import { initSpeechToText } from "../../utils/speechToText";
import MicrophoneButton from "./ChatFormat/SpeechToText/MicrophoneButton";
import TemporaryChatManager from "./TemporaryChat/TemporaryChatManager";
import { useVariables } from "./VariablePrompt/VariableContext";
import "./VariablePrompt/Variables.css";
import {
  CodeOutlined,
  SlidersOutlined,
  SendOutlined,
  BookOutlined,
} from "@ant-design/icons";
import VariableManager from "./VariablePrompt/VariableManager";
import { analyzeImagePrompt } from "../../utils/imagePromptDetection";
import { getModelConfig } from "../../config/modelConfig";
import {
  formatImageGenerationRequest,
  extractImageUrlFromResponse,
} from "../../utils/imageGenerationUtils";
import { streamOllamaResponse, OllamaError } from "../../utils/ollamaUtils";
import { ModelProvider } from "../../config/modelConfig";
import { v4 as uuidv4 } from "uuid";
import { OllamaStatus } from "./OllamaSetup/OllamaStatus";

const { TextArea } = Input;

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  status: string;
  responseTime: number;
  isTyping?: boolean;
  responseTokens?: number;
  model?: string;
  mode: string;
  agentType: string;
  timestamp: string;
  isImageGeneration?: boolean;
  imageUrl?: string;
}

interface APIResponse {
  response: string;
  model: string;
  responseTime: number;
  responseTokens: number;
}

interface ChatInterfaceProps {
  onViewChange?: (view: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onViewChange }) => {
  const {
    activeChat,
    addMessage,
    selectedModel,
    getModelApiKey,
    mode,
    agentType,
    isTemporaryMode,
    setTemporaryMode,
    temporaryMessages,
    setTemporaryMessages,
  } = useApp();
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [localInput, setLocalInput] = useState("");
  const rafRef = useRef<number>();
  const [isListening, setIsListening] = useState(false);
  const speechControls = useRef<ReturnType<typeof initSpeechToText> | null>(
    null,
  );
  const [isVariablesModalOpen, setIsVariablesModalOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [promptSuggestions, setPromptSuggestions] = useState<
    Array<{ title: string; content: string }>
  >([]);
  const { variables, getVariableValue, substituteVariables } = useVariables();
  const { message } = App.useApp();
  const [ollamaConnected, setOllamaConnected] = useState(true);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setLocalInput(value);

      // Check for variable suggestions
      const cursorPosition = e.target.selectionStart;
      const textBeforeCursor = value.slice(0, cursorPosition);

      // Check for prompt suggestions (when user types /)
      if (textBeforeCursor.endsWith("/")) {
        const savedPrompts = localStorage.getItem("PC_customPrompts");
        if (savedPrompts) {
          const prompts = JSON.parse(savedPrompts);
          setPromptSuggestions(
            prompts.map((p: any) => ({
              title: p.title,
              content: p.content,
            })),
          );
        }
      } else if (textBeforeCursor.endsWith("/")) {
        // Keep showing suggestions if the last character is still "/"
        return;
      } else {
        // Clear prompt suggestions if "/" is removed
        setPromptSuggestions([]);
      }

      // Check for variable suggestions
      const match = textBeforeCursor.match(/__\$[a-zA-Z0-9_]*$/);
      if (match) {
        const searchTerm = match[0].slice(3).toLowerCase();
        const matchingVars = variables
          .filter((v) => v.name.toLowerCase().includes(searchTerm))
          .map((v) => v.name);
        setSuggestions(matchingVars);
      } else {
        setSuggestions([]);
      }

      // Cancel any pending updates
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Schedule update on next frame
      rafRef.current = requestAnimationFrame(() => {
        setLocalInput(value);
      });
    },
    [variables],
  );

  const insertVariable = (varName: string) => {
    const cursorPosition =
      document.querySelector("textarea")?.selectionStart || 0;
    const textBeforeCursor = localInput.slice(0, cursorPosition);
    const textAfterCursor = localInput.slice(cursorPosition);

    // Find the start of the variable reference
    const matchStart = textBeforeCursor.lastIndexOf("__$");
    if (matchStart === -1) return;

    const newText =
      textBeforeCursor.slice(0, matchStart) + `__$${varName}` + textAfterCursor;
    setLocalInput(newText);
    setSuggestions([]);
  };

  const insertPrompt = (content: string) => {
    const cursorPosition =
      document.querySelector("textarea")?.selectionStart || 0;
    const textBeforeCursor = localInput.slice(0, cursorPosition);
    const textAfterCursor = localInput.slice(cursorPosition);

    // Remove the trailing '/' and add the prompt content
    const newText = textBeforeCursor.slice(0, -1) + content + textAfterCursor;
    setLocalInput(newText);
    setPromptSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (suggestions.length > 0) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        // Implement suggestion navigation
      } else if (e.key === "Enter" && suggestions.length === 1) {
        e.preventDefault();
        insertVariable(suggestions[0]);
      } else if (e.key === "Escape") {
        setSuggestions([]);
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localInput.trim() || isTyping || isThinking) return;

    // If using Ollama and not connected, prevent sending
    if (
      getModelConfig(selectedModel).provider === ModelProvider.Ollama &&
      !ollamaConnected
    ) {
      message.error("Cannot send message: Ollama is not connected", 3);
      return;
    }

    try {
      // Check for API key
      const apiKey = getModelApiKey(selectedModel);
      if (!apiKey) {
        setShowApiKeyModal(true);
        return;
      }

      const { text: processedText, missingVariables } =
        substituteVariables(localInput);

      if (missingVariables.length > 0) {
        message.error(`Missing variables: ${missingVariables.join(", ")}`);
        return;
      }

      await handleSendMessage(processedText);
      setLocalInput("");
    } catch (error) {
      logInfo("message", "message_submit_failed", {
        component: "ChatInterface",
        metadata: {
          message,
          error,
          model: selectedModel,
        },
      });
    }
  };

  const regenerateResponse = async (
    content: string,
    isSingleMessage: boolean = false,
  ) => {
    if (!content.trim() || isTyping || isThinking) return;

    try {
      // Check for API key
      const apiKey = getModelApiKey(selectedModel);
      if (!apiKey) {
        setShowApiKeyModal(true);
        return;
      }

      const { text: processedText, missingVariables } =
        substituteVariables(content);

      if (missingVariables.length > 0) {
        message.error(`Missing variables: ${missingVariables.join(", ")}`);
        return;
      }

      // Skip adding user message if it's already in the chat (single message case)
      await handleSendMessage(processedText, isSingleMessage);
    } catch (error) {
      logInfo("message", "message_regeneration_failed", {
        component: "ChatInterface",
        metadata: {
          message: content,
          error,
          model: selectedModel,
        },
      });
    }
  };

  const replaceVariablesInPrompt = (prompt: string): string => {
    let replacedPrompt = prompt;
    variables.forEach((variable) => {
      const pattern = new RegExp(`__\\$${variable.name}\\b`, "g");
      replacedPrompt = replacedPrompt.replace(pattern, variable.value);
    });
    return replacedPrompt;
  };

  const getApiEndpoint = (mode: string, agentType: string) => {
    if (mode === "agent") {
      switch (agentType) {
        case "research":
          return "/api/v1/ai/agents/scott";
        case "tech":
          return "/api/v1/ai/agents/jordan";
        default:
          return "/api/v1/ai/query";
      }
    }
    return "/api/v1/ai/query";
  };

  const handleSendMessage = async (
    message: string,
    skipUserMessage: boolean = false,
  ) => {
    const startTime = Date.now();
    try {
      const promptAnalysis = analyzeImagePrompt(message);

      logInfo("message", "send_started", {
        component: "ChatInterface",
        metadata: {
          messageLength: message.length,
          model: selectedModel,
          isImageRequest: promptAnalysis.isImageRequest,
        },
      });

      const userContent = message.trim();
      setLocalInput("");

      try {
        let updatedChatWithUser: any;
        const valueSubstitutedPrompt = replaceVariablesInPrompt(userContent);
        const modelConfig = getModelConfig(selectedModel);

        // Only add user message if not skipping (not a single message regeneration)
        if (skipUserMessage) {
          if (isTemporaryMode) {
            updatedChatWithUser = {
              messages: temporaryMessages,
              model: selectedModel,
            };
          } else {
            updatedChatWithUser = activeChat;
          }
        } else {
          if (isTemporaryMode) {
            updatedChatWithUser = {
              content: valueSubstitutedPrompt,
              role: "user" as const,
              responseTime: 0,
              responseTokens: 0,
              model: localStorage.getItem("PC_selectedModel"),
            };
            setTemporaryMessages((prev) => [...prev, updatedChatWithUser]);
          } else {
            // Add user message and wait for state update
            updatedChatWithUser = addMessage({
              content: valueSubstitutedPrompt,
              role: "user",
              status: "user sending",
              mode: mode,
              agentType: agentType,
              isImageGeneration: promptAnalysis.isImageRequest,
            } as Message);

            if (!updatedChatWithUser) return;
          }
        }

        // Show thinking state first
        setIsThinking(true);

        try {
          // Get model settings from localStorage
          const modelSettings = JSON.parse(
            localStorage.getItem("PC_modelSettings") || "{}",
          );
          const apiKeys = JSON.parse(
            localStorage.getItem("PC_modelApiKeys") || "{}",
          );

          // Get settings for the selected model
          const currentModelSettings =
            modelSettings[updatedChatWithUser.model] || {};
          const apiKey = apiKeys[updatedChatWithUser.model];

          if (!apiKey) {
            throw new Error("API key not found for the selected model");
          }

          const requestData = promptAnalysis.isImageRequest
            ? {
                ...formatImageGenerationRequest(
                  modelConfig.provider,
                  valueSubstitutedPrompt,
                  modelConfig,
                ),
                model: updatedChatWithUser.model,
                apiKey: apiKey,
              }
            : {
                model: updatedChatWithUser.model,
                apiKey: apiKey,
                prompt: valueSubstitutedPrompt,
                messages:
                  isTemporaryMode === true
                    ? temporaryMessages
                    : updatedChatWithUser.messages || [],
                chatId: updatedChatWithUser.id,
                ...currentModelSettings,
              };

          const endpoint = promptAnalysis.isImageRequest
            ? "/api/v1/ai/visuals"
            : getApiEndpoint(mode, agentType);

          if (modelConfig.provider === ModelProvider.Ollama) {
            await handleOllamaMessage(
              updatedChatWithUser.messages,
              modelConfig,
            );
            return;
          }

          await axios
            .post<APIResponse>(endpoint, requestData, { timeout: 15000 })
            .then(async (assitantApiResponse) => {
              if (assitantApiResponse.status === 200) {
                if (promptAnalysis.isImageRequest) {
                  const imageUrl = extractImageUrlFromResponse(
                    modelConfig.provider,
                    assitantApiResponse.data,
                  );
                  const aiResponse = valueSubstitutedPrompt; // Store the original prompt as the message content
                  const tokensUsed = assitantApiResponse.data.responseTokens;
                  if (isTemporaryMode) {
                    setTemporaryMessages((prev) => [
                      ...prev,
                      {
                        content: aiResponse,
                        role: "assistant",
                        responseTime: 0,
                        responseTokens: tokensUsed,
                        model: updatedChatWithUser.model,
                        isImageGeneration: true,
                        imageUrl: imageUrl,
                      },
                    ]);
                  } else {
                    // After animation completes, add the AI message
                    addMessage({
                      content: aiResponse,
                      role: "assistant",
                      status: "ai completed",
                      responseTime: 0,
                      responseTokens: tokensUsed,
                      model: updatedChatWithUser.model,
                      mode: mode,
                      agentType: agentType,
                      isImageGeneration: true,
                      imageUrl: imageUrl,
                    } as Message);
                  }
                } else {
                  const aiResponse = assitantApiResponse.data.response;
                  const responseTime = assitantApiResponse.data.responseTime;
                  const tokensUsed = assitantApiResponse.data.responseTokens;
                  // Start AI response with animation
                  setIsThinking(false);
                  setIsTyping(true);

                  // Animate the response character by character
                  const chars = aiResponse.split("");
                  let displayText = "";
                  const chunkSize = 10; // Process multiple characters at once

                  for (let i = 0; i < chars.length; i += chunkSize) {
                    const chunk = chars.slice(i, i + chunkSize).join("");
                    displayText += chunk;
                    setTypingText(displayText);
                    // Faster typing speed (15ms) but still visible
                    await new Promise((resolve) => setTimeout(resolve, 15));
                  }

                  // Clear typing animation
                  setTypingText("");
                  setIsTyping(false);

                  if (isTemporaryMode) {
                    setTemporaryMessages((prev) => [
                      ...prev,
                      {
                        content: aiResponse,
                        role: "assistant",
                        responseTime: responseTime,
                        responseTokens: tokensUsed,
                        model: updatedChatWithUser.model,
                      },
                    ]);
                  } else {
                    // After animation completes, add the AI message
                    addMessage({
                      content: aiResponse,
                      role: "assistant",
                      status: "ai completed",
                      responseTime: responseTime,
                      responseTokens: tokensUsed,
                      model: updatedChatWithUser.model,
                      mode: mode,
                      agentType: agentType,
                    } as Message);
                  }
                }
              }
            })
            .catch((e: any) => {
              if (agentType != "na") {
                const aiResponse = `I am unable to process your request. Reason: "${e.response.data.error}" (Status: ${e.response.status}). If you feel this is an issue with PromptCue please reach out to support@promptcue.com`;
                if (isTemporaryMode) {
                  setTemporaryMessages((prev) => [
                    ...prev,
                    {
                      content: aiResponse,
                      role: "assistant",
                      responseTime: 0,
                      responseTokens: 0,
                      model: updatedChatWithUser.model,
                    },
                  ]);
                } else {
                  // After animation completes, add the AI message
                  addMessage({
                    content: aiResponse,
                    role: "assistant",
                    status: "ai completed",
                    responseTime: 0,
                    responseTokens: 0,
                    model: updatedChatWithUser.model,
                    mode: mode,
                    agentType: agentType,
                  } as Message);
                }
              } else {
                const aiResponse = `${formatModelName(updatedChatWithUser.model)} is unable to generate a response. Reason: "${updatedChatWithUser.model.includes("gemini") || updatedChatWithUser.model.includes("claude") ? e.response.data.error.message : e.response.data.error}" (Status: ${e.response.status}). If you feel this is an issue with PromptCue please reach out to support@promptcue.com`;
                if (isTemporaryMode) {
                  setTemporaryMessages((prev) => [
                    ...prev,
                    {
                      content: aiResponse,
                      role: "assistant",
                      responseTime: 0,
                      responseTokens: 0,
                      model: updatedChatWithUser.model,
                    },
                  ]);
                } else {
                  // After animation completes, add the AI message
                  addMessage({
                    content: aiResponse,
                    role: "assistant",
                    status: "ai completed",
                    responseTime: 0,
                    responseTokens: 0,
                    model: updatedChatWithUser.model,
                    mode: mode,
                    agentType: agentType,
                  } as Message);
                }
              }
            });
        } catch (error) {
          console.error("Error in chat:", error);
          // Show error in UI
          setTypingText(
            "Error: " + (error.message || "Failed to get response from AI"),
          );
          setIsTyping(false);
        } finally {
          setIsThinking(false);
        }
      } catch (error) {
        console.error("Error in chat interaction:", error);
        setIsThinking(false);
        setIsTyping(false);
        setTypingText("");
      }

      const duration = Date.now() - startTime;
      logInfo("message", "send_completed", {
        component: "ChatInterface",
        duration,
        metadata: { messageLength: message.length },
      });

      if (duration > 5000) {
        logWarning("performance", "slow_message_processing", {
          component: "ChatInterface",
          duration,
          metadata: { threshold: 5000 },
        });
      }
    } catch (error) {
      logError("message", "send_failed", error as Error, {
        component: "ChatInterface",
        duration: Date.now() - startTime,
      });
      throw error;
    }
  };

  const handleOllamaMessage = async (messages: Message[], modelConfig: any) => {
    let responseContent = "";
    const startTime = Date.now();

    try {
      // Initially show thinking state
      setIsThinking(true);
      setIsTyping(false);
      setTypingText("");

      await streamOllamaResponse(
        modelConfig,
        messages,
        (chunk) => {
          // Just accumulate the response without showing typing yet
          responseContent += chunk;
        },
        (error: OllamaError) => {
          if (error.code === "CONNECTION_ERROR") {
            message.error(
              "Failed to connect to Ollama. Please check if Ollama is running.",
            );
          } else {
            message.error(
              error.message ||
                "An error occurred while processing your message",
            );
          }
          setIsThinking(false);
          setIsTyping(false);
          setTypingText("");
        },
        () => {
          // When streaming is complete, start typing animation
          setIsThinking(false);
          setIsTyping(true);

          // Animate typing with chunks
          const animateTyping = async () => {
            const chars = responseContent.split("");
            let displayText = "";
            const chunkSize = 10; // Process 10 characters at once

            for (let i = 0; i < chars.length; i += chunkSize) {
              const chunk = chars.slice(i, i + chunkSize).join("");
              displayText += chunk;
              setTypingText(displayText);
              // Fast but visible typing speed
              await new Promise((resolve) => setTimeout(resolve, 15));
            }

            // Animation complete, add message to conversation
            setIsTyping(false);
            setTypingText("");

            if (isTemporaryMode) {
              setTemporaryMessages((prev) => [
                ...prev,
                {
                  content: responseContent,
                  role: "assistant",
                  responseTime: Date.now() - startTime,
                  responseTokens: Math.floor(responseContent.length / 4),
                  model: selectedModel,
                },
              ]);
            } else {
              addMessage({
                id: uuidv4(),
                content: responseContent,
                role: "assistant",
                status: "ai completed",
                responseTime: Date.now() - startTime,
                responseTokens: Math.floor(responseContent.length / 4),
                model: selectedModel,
                mode,
                agentType,
                timestamp: new Date().toISOString(),
              } as Message);
            }
          };

          // Start the animation
          animateTyping().catch((error) => {
            console.error("Error during typing animation:", error);
            // If animation fails, just show the message
            setIsTyping(false);
            setTypingText("");
            addMessage({
              id: uuidv4(),
              content: responseContent,
              role: "assistant",
              status: "ai completed",
              responseTime: Date.now() - startTime,
              responseTokens: Math.floor(responseContent.length / 4),
              model: selectedModel,
              mode,
              agentType,
              timestamp: new Date().toISOString(),
            } as Message);
          });
        },
      );
    } catch (error) {
      console.error("Error in Ollama chat:", error);
      // Clear all states on error
      setIsThinking(false);
      setIsTyping(false);
      setTypingText("");
      message.error("Failed to process Ollama response");
    }
  };

  const formatModelName = (name: string): string => {
    return name
      .split("-")
      .map((part) => {
        if (part.toLowerCase() === "gpt") return "GPT";
        if (!isNaN(Number(part))) return part;
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join(" ");
  };

  useEffect(() => {
    // Check for prompt from PromptLibrary
    const savedPrompt = localStorage.getItem("PC_currentPrompt");
    if (savedPrompt) {
      setLocalInput(savedPrompt);
      localStorage.removeItem("PC_currentPrompt"); // Clear it after loading
    }
  }, []);

  useEffect(() => {
    speechControls.current = initSpeechToText({
      onTranscript: (text) => {
        setLocalInput((prev) => prev + " " + text);
      },
      onStart: () => setIsListening(true),
      onEnd: () => setIsListening(false),
      onError: () => setIsListening(false),
    });

    return () => {
      if (speechControls.current) {
        speechControls.current.stopListening();
      }
    };
  }, []);

  const handleMicClick = () => {
    if (!speechControls.current) return;

    if (isListening) {
      speechControls.current.stopListening();
    } else {
      speechControls.current.startListening();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  return (
    <div className="chat-content">
      <VariableManager
        isOpen={isVariablesModalOpen}
        onClose={() => setIsVariablesModalOpen(false)}
      />

      {getModelConfig(selectedModel).provider === ModelProvider.Ollama && (
        <OllamaStatus
          modelConfig={getModelConfig(selectedModel)}
          onConnectionChange={setOllamaConnected}
          autoCheck={true}
        />
      )}
      {(!activeChat ||
        !activeChat.messages ||
        activeChat.messages.length === 0) &&
      (!isTemporaryMode || !temporaryMessages?.length) ? (
        <div className="welcome-screen">
          <SuggestionBubbles
            onSuggestionClick={(suggestion) => setLocalInput(suggestion)}
          />
        </div>
      ) : (
        <div className="message-container">
          {agentType != "na" && (
            <div className="welcome-screen">
              <SuggestionBubbles
                onSuggestionClick={(suggestion) => setLocalInput(suggestion)}
              />
            </div>
          )}
          {isTemporaryMode === false && (
            <ListMessages onRegenerate={regenerateResponse} />
          )}
          {isTemporaryMode === false && isThinking && (
            <ThinkingIndicator agentType={agentType} isRegenerating={false} />
          )}
          {isTemporaryMode === false && isTyping && (
            <div className="message-wrapper ai typing-message">
              <div className="message-inner">
                <MessageAvatar sender="ai" />
                <div className="message-content">
                  <FormattedMessage content={typingText} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      <div className="input-container">
        <TemporaryChatManager
          onMessageSubmit={handleSubmit}
          isTyping={isTyping}
          isThinking={isThinking}
          isTemporaryMode={isTemporaryMode}
          setIsTemporaryMode={setTemporaryMode}
          temporaryMessages={temporaryMessages}
          setTemporaryMessages={setTemporaryMessages}
          setTypingText={typingText}
          messagesEndRef={messagesEndRef}
          onRegenerate={regenerateResponse}
        />
        <form onSubmit={handleSubmit} className="input-form">
          <div className="chat-input-container">
            <div className="input-box">
              <TextArea
                value={localInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="How can I assist you today?"
                autoSize={{ minRows: 1, maxRows: 5 }}
              />
              {promptSuggestions.length > 0 && (
                <div className="variable-suggestions prompt-suggestions">
                  <div className="suggestions-header">
                    <span className="suggestions-title">Saved Prompts</span>
                    <span className="suggestions-count">
                      {promptSuggestions.length}
                    </span>
                  </div>
                  {promptSuggestions.map((prompt) => (
                    <div
                      key={prompt.title}
                      className="suggestion-item saved-prompt-item"
                      onClick={() => insertPrompt(prompt.content)}
                    >
                      {prompt.title}
                    </div>
                  ))}
                </div>
              )}
              {suggestions.length > 0 && (
                <div className="variable-suggestions">
                  <div className="suggestions-header">
                    <span className="suggestions-title">
                      Available Variables
                    </span>
                    <span className="suggestions-count">
                      {suggestions.length}
                    </span>
                  </div>
                  {suggestions.map((varName) => (
                    <div
                      key={varName}
                      className="suggestion-item"
                      onClick={() => insertVariable(varName)}
                    >
                      {varName}
                    </div>
                  ))}
                </div>
              )}
              <div className="input-actions">
                {localInput.trim() ? (
                  <Tooltip title="Send Prompt">
                    <Button
                      type="primary"
                      className="send-button"
                      onClick={handleSubmit}
                      disabled={isTyping || isThinking}
                    >
                      <SendOutlined />
                    </Button>
                  </Tooltip>
                ) : (
                  <div
                    className={`mic-button-wrapper ${isListening ? "listening" : ""}`}
                  >
                    <MicrophoneButton
                      isListening={isListening}
                      onClick={handleMicClick}
                      disabled={isTyping || isThinking}
                    />
                    {isListening && <div className="mic-pulse"></div>}
                  </div>
                )}
              </div>
            </div>
            <div className="chat-features">
              <div className="features-left">
                <Button
                  className="feature-button variables-button"
                  onClick={() => setIsVariablesModalOpen(true)}
                >
                  <Tooltip title="Prompt Variables">
                    <CodeOutlined className="chat-feature-icon" />
                  </Tooltip>
                  {variables.length > 0 && (
                    <span className="variable-count">{variables.length}</span>
                  )}
                </Button>
                <Tooltip title="Model Settings">
                  <SlidersOutlined
                    className="chat-feature-icon"
                    onClick={() => onViewChange?.("models")}
                  />
                </Tooltip>
                <Tooltip title="Prompt Library">
                  <BookOutlined
                    className="chat-feature-icon"
                    onClick={() => onViewChange?.("promptLibrary")}
                  />
                </Tooltip>
                {/* Add more feature buttons here */}
              </div>
              <div className="features-right">
                {/* Add right-aligned features here if needed */}
              </div>
            </div>
          </div>
        </form>
        <Disclaimer />
      </div>

      {window.innerWidth <= 768 && <div style={{ paddingTop: "12%" }}></div>}

      <ApiKeyModal
        isVisible={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        modelName={selectedModel}
      />
    </div>
  );
};

export default ChatInterface;
