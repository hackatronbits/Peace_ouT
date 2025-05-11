import React, { useState, useEffect } from "react";
import { App, Tooltip, Popconfirm } from "antd";
import "./TemporaryChat.css";
import { useApp } from "../../../context/AppContext";
import MessageAvatar from "../ChatFormat/MessageAvatar";
import FormattedMessage from "../ChatFormat/FormattedMessage";
import Paragraph from "antd/es/typography/Paragraph";
import { ThinkingIndicator } from "../ChatFormat/ThinkingIndicator";
import {
  DeleteTwoTone,
  CopyOutlined,
  CheckOutlined,
  SyncOutlined,
} from "@ant-design/icons";

export interface TempMessage {
  content: string;
  role: "user" | "assistant";
  responseTime: number;
  responseTokens: number;
  model: string;
}

export interface TemporaryChatManagerProps {
  onMessageSubmit: (e: React.FormEvent) => Promise<void>;
  isTyping: boolean;
  isThinking: boolean;
  isTemporaryMode: boolean;
  setIsTemporaryMode: React.Dispatch<React.SetStateAction<boolean>>;
  temporaryMessages: TempMessage[];
  setTemporaryMessages: React.Dispatch<React.SetStateAction<TempMessage[]>>;
  setTypingText: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onRegenerate: (content: string, isSingleMessage: boolean) => Promise<void>;
}

const TemporaryChatManager: React.FC<TemporaryChatManagerProps> = ({
  onMessageSubmit,
  isTyping,
  isThinking,
  isTemporaryMode,
  setIsTemporaryMode,
  temporaryMessages,
  setTemporaryMessages,
  setTypingText,
  messagesEndRef,
  onRegenerate,
}) => {
  const {
    startNewChat,
    agentType,
    deleteTemporaryMessage,
    deleteTemporaryMessagesAfterIndex,
  } = useApp();
  const [sessionTimer, setSessionTimer] = useState<number>(30 * 60);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const { message } = App.useApp();

  const handleSessionEnd = async () => {
    setIsSessionActive(false);
    setIsTemporaryMode(false);
    setTemporaryMessages([]);
    await startNewChat();
    message.success(
      "Temporary chat session ended. All messages have been cleared.",
    );
  };

  // Session timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTemporaryMode && isSessionActive && sessionTimer > 0) {
      interval = setInterval(() => {
        setSessionTimer((prev) => {
          if (prev <= 1) {
            handleSessionEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTemporaryMode, isSessionActive, sessionTimer]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isTemporaryMode) {
        handleSessionEnd();
      }
    };
  }, []);

  const handleRegenerate = async (index: number) => {
    try {
      // Get the last user message before this AI response
      let lastUserMessageIndex = index - 1;
      while (
        lastUserMessageIndex >= 0 &&
        temporaryMessages[lastUserMessageIndex].role !== "user"
      ) {
        lastUserMessageIndex--;
      }

      if (lastUserMessageIndex < 0) return;

      // Get user message content for regeneration
      const userMessage = temporaryMessages[lastUserMessageIndex].content;

      // Delete messages and regenerate
      const { isSingleMessage } =
        await deleteTemporaryMessagesAfterIndex(index);
      await onRegenerate(userMessage, isSingleMessage);
    } catch (error) {
      console.error("Error regenerating temporary message:", error);
    }
  };

  return (
    <div>
      {isTemporaryMode && (
        <>
          <div>
            {temporaryMessages.map((msg, index) => (
              <div
                key={`temp-${index}`}
                className={`message-wrapper ${msg.role === "user" ? "user" : "ai"}`}
              >
                <div className="message-inner">
                  <MessageAvatar sender={msg.role === "user" ? "user" : "ai"} />
                  <div className="message-content">
                    {msg.role === "assistant" && (
                      <div className="response-time">
                        {msg.responseTime > 0 ? (
                          <Tooltip title="Response Time">
                            ⏱️ {(msg.responseTime / 1000).toFixed(2)}s
                          </Tooltip>
                        ) : (
                          <Tooltip title="Response Time">⏱️ NA</Tooltip>
                        )}
                        <Tooltip
                          title="Response Length"
                          style={{ marginLeft: "10px" }}
                        >
                          📝 {msg.content.length} chars
                        </Tooltip>
                        <Tooltip
                          title="Response Consumed"
                          style={{ marginLeft: "10px" }}
                        >
                          📜 {msg.responseTokens} tokens
                        </Tooltip>
                      </div>
                    )}
                    {msg.role === "assistant" ? (
                      <FormattedMessage content={msg.content} />
                    ) : (
                      msg.content
                    )}
                    <Paragraph
                      copyable={{
                        text: msg.content,
                        icon: [
                          <CopyOutlined
                            key="copy-icon"
                            style={{ color: "#84868a" }}
                          />,
                          <CheckOutlined
                            key="check-icon"
                            style={{ color: "#84868a" }}
                          />,
                        ],
                      }}
                      style={{
                        color: "#000000",
                        padding: "0.5% 0% 0.5% 2%",
                        float: "right",
                        fontSize: "15px",
                      }}
                    />
                    <Popconfirm
                      title="Delete Message"
                      description="Are you sure you want to delete this temporary message?"
                      okText="Delete"
                      cancelText="Cancel"
                      okType="default"
                      onConfirm={() => deleteTemporaryMessage(index)}
                      placement="top"
                      rootClassName="delete-pop-confirm"
                      okButtonProps={{
                        className: "delete-message-btn",
                        style: { backgroundColor: "#eb2f96", color: "white" },
                      }}
                    >
                      <Tooltip title="Delete">
                        <DeleteTwoTone
                          style={{
                            margin: " 0.9% 0% 0.6% 2%",
                            float: "right",
                            fontSize: "17px",
                          }}
                          twoToneColor="#84868a"
                        />
                      </Tooltip>
                    </Popconfirm>
                    {msg.role === "assistant" && (
                      <Popconfirm
                        title="Regenerate Response"
                        description="This will delete all messages after this response (if any). Are you sure?"
                        okText="Regenerate"
                        cancelText="Cancel"
                        okType="default"
                        onConfirm={() => handleRegenerate(index)}
                        placement="top"
                        rootClassName="delete-pop-confirm"
                        okButtonProps={{
                          className: "regenerate-btn",
                        }}
                        cancelButtonProps={{
                          className: "cancel-message-btn",
                        }}
                      >
                        <Tooltip title="Regenerate">
                          <SyncOutlined
                            style={{
                              margin: "0.9% 0% 0.6% 2%",
                              float: "right",
                              fontSize: "17px",
                              color: "#84868a",
                            }}
                          />
                        </Tooltip>
                      </Popconfirm>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isThinking && (
              <ThinkingIndicator agentType={agentType} isRegenerating={false} />
            )}
            {isTyping && (
              <div className="message-wrapper ai typing-message">
                <div className="message-inner">
                  <MessageAvatar sender="ai" />
                  <div className="message-content">
                    <FormattedMessage content={setTypingText} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </>
      )}
    </div>
  );
};

export default TemporaryChatManager;
