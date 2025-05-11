import React, { useState, useRef, useEffect } from "react";
import { Input, Button, Spin, Tooltip } from "antd";
import { useApp } from "../../context/AppContext";
import MessageAvatar from "./ChatFormat/MessageAvatar";
import ApiKeyModal from "./KeyManagement/ApiKeyModal";
import "./ChatInterface.css";
import { SendOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import axios from "axios";
import FormattedMessage from "./ChatFormat/FormattedMessage";
import "./ChatFormat/FormattedMessage.css";

const { Paragraph, Text } = Typography;
const { TextArea } = Input;

interface Message {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
  status: string;
  responseTime?: number;
  isTyping?: boolean;
  tokens_used?: number;
  model?: string;
}

interface APIResponse {
  response: string;
  model: string;
  responseTime: number;
  tokens_used: number;
}

const ChatInterface = () => {
  const {
    activeChat,
    setActiveChat,
    chats,
    setChats,
    addMessage,
    selectedModel,
    getModelApiKey,
  } = useApp();
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [finalResponse, setFinalResponse] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

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

  const handleSendMessage = async (message: string) => {
    const startTime = Date.now();
    try {
      

      const userContent = message.trim();
      setInputMessage("");

      try {
        // Add user message and wait for state update
        const updatedChatWithUser = addMessage({
          content: userContent,
          role: "user",
          status: "user sending",
        } as Message);

        if (!updatedChatWithUser) return;

        // Show thinking state first
        setIsThinking(true);

        try {
          // Get model settings from localStorage
          const modelSettings = JSON.parse(
            localStorage.getItem("modelSettings") || "{}",
          );
          const apiKeys = JSON.parse(
            localStorage.getItem("modelApiKeys") || "{}",
          );

          // Get settings for the selected model
          const currentModelSettings =
            modelSettings[updatedChatWithUser.model] || {};
          const apiKey = apiKeys[updatedChatWithUser.model];

          if (!apiKey) {
            throw new Error("API key not found for the selected model");
          }

          // Make API request
          const response = await axios.post<APIResponse>("/api/v1/ai/query", {
            model: updatedChatWithUser.model,
            apiKey: apiKey,
            prompt: message,
            messages: updatedChatWithUser.messages || [],
            ...currentModelSettings, // Include all model-specific settings
          });

          // Start AI response with animation
          setIsThinking(false);
          setIsTyping(true);
          const aiResponse = response.data.response;
          const responseTime = response.data.responseTime;
          const tokensUsed = response.data.tokens_used;

          // Animate the response character by character
          const chars = aiResponse.split("");
          let displayText = "";
          const chunkSize = 3; // Process multiple characters at once

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

          // After animation completes, add the AI message
          await addMessage({
            content: aiResponse,
            role: "assistant",
            status: "ai completed",
            responseTime: responseTime,
            tokens_used: tokensUsed,
            model: updatedChatWithUser.model,
          } as Message);
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
      
  
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isTyping || isThinking) return;

    // Check for API key
    const apiKey = getModelApiKey(selectedModel);
    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }

    await handleSendMessage(inputMessage);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="chat-content">
      {!activeChat ||
      !activeChat.messages ||
      activeChat.messages.length === 0 ? (
        <div className="welcome-screen">
          <p>Let's get started</p>
        </div>
      ) : (
        <div className="message-container">
          {activeChat?.messages.map((message) => (
            <div
              key={message.id}
              className={`message-wrapper ${message.role === "user" ? "user" : "ai"}`}
            >
              <div className="message-inner">
                <MessageAvatar
                  sender={message.role === "user" ? "user" : "ai"}
                />
                <div className="message-content">
                  {message.role === "assistant" && message.responseTime && (
                    <div className="response-time">
                      <Tooltip title="Time Taken">
                        ⏱️ {(message.responseTime / 1000).toFixed(2)}s
                      </Tooltip>
                      <Tooltip
                        title="Response Length"
                        style={{ marginLeft: "10px" }}
                      >
                        📝 {message.content.length} chars
                      </Tooltip>
                      <Tooltip
                        title="Model Used"
                        style={{ marginLeft: "10px" }}
                      >
                        🤖 {formatModelName(activeChat.model)}
                      </Tooltip>
                    </div>
                  )}
                  {/* <br/> */}
                  {message.role === "assistant" ? (
                    <FormattedMessage content={message.content} />
                  ) : (
                    message.content
                  )}
                  <Paragraph
                    copyable={{ text: message.content }}
                    style={{
                      color: "#000000",
                      paddingTop: "2%",
                      paddingLeft: "2%",
                      float: "right",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="message-wrapper ai thinking-message">
              <div className="message-inner">
                <MessageAvatar sender="ai" />
                <div className="message-content thinking">
                  <Spin size="small" />
                  <span style={{ marginLeft: "10px" }}>
                    Assistant is processing your request...
                  </span>
                </div>
              </div>
            </div>
          )}
          {isTyping && (
            <div className="message-wrapper ai typing-message">
              <div className="message-inner">
                <MessageAvatar sender="ai" />
                <div className="message-content">
                  <FormattedMessage content={typingText} />
                  {/* <span className="typing-cursor">|</span> */}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      <div className="input-container">
        <form onSubmit={handleSubmit} className="input-form">
          <div className="input-box">
            <TextArea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Interact with ${activeChat?.model ? formatModelName(activeChat.model) : "AI"}...`}
              autoSize={{ minRows: 1, maxRows: 5 }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSubmit}
              disabled={!inputMessage.trim() || isTyping || isThinking}
              className="send-button"
            />
          </div>
        </form>
      </div>

      <ApiKeyModal
        isVisible={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        modelName={selectedModel}
      />
    </div>
  );
};

export default ChatInterface;
