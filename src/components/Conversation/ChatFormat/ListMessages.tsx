import { Tooltip, App, Popconfirm } from "antd";
import MessageAvatar from "./MessageAvatar";
import FormattedMessage from "./FormattedMessage";
import { Typography } from "antd";
import { useApp } from "../../../context/AppContext";
import { Fragment, useState } from "react";
import {
  CopyOutlined,
  CheckOutlined,
  SyncOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { ThinkingIndicator } from "./ThinkingIndicator";

const { Paragraph } = Typography;

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

interface ListMessagesProps {
  onRegenerate: (content: string, isSingleMessage: boolean) => Promise<void>;
}

export const ListMessages: React.FC<ListMessagesProps> = ({ onRegenerate }) => {
  const { activeChat, deleteMessage, deleteMessagesAfterIndex } = useApp();

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time part for accurate date comparison
    const compareDate = new Date(date);
    [today, yesterday, compareDate].forEach((d) => {
      d.setHours(0, 0, 0, 0);
    });

    if (compareDate.getTime() === today.getTime()) {
      return "Today";
    }
    if (compareDate.getTime() === yesterday.getTime()) {
      return "Yesterday";
    }

    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Group messages by date
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};

    messages.forEach((message) => {
      const date = formatDate(new Date(message.timestamp));
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate(activeChat?.messages || []);
  const [regeneratingTempStatus, setRegeneratingTempStatus] = useState(false);

  const handleRegenerate = async (messageId: string) => {
    try {
      if (!activeChat) return;

      setRegeneratingTempStatus(true);

      // Find the message to regenerate
      const messageIndex = activeChat.messages.findIndex(
        (msg) => msg.id === messageId,
      );
      if (messageIndex === -1) return;

      // Get the last user message before this AI response
      let lastUserMessageIndex = messageIndex - 1;
      while (
        lastUserMessageIndex >= 0 &&
        activeChat.messages[lastUserMessageIndex].role !== "user"
      ) {
        lastUserMessageIndex--;
      }

      if (lastUserMessageIndex < 0) return;

      // Get user message content for regeneration
      const userMessage = activeChat.messages[lastUserMessageIndex].content;

      // Delete messages and regenerate
      const { isSingleMessage } = await deleteMessagesAfterIndex(messageId);
      setRegeneratingTempStatus(false);
      await onRegenerate(userMessage, isSingleMessage);
    } catch (error) {
      console.error("Error regenerating message:", error);
    }
  };

  return (
    <>
      {Object.entries(messageGroups).map(([date, messages]) => (
        <Fragment key={date}>
          <div className="date-separator">
            <div className="date-label">{date}</div>
          </div>

          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-wrapper ${message.role === "user" ? "user" : "ai"}`}
            >
              <div className="message-inner">
                <MessageAvatar
                  sender={message.role === "user" ? "user" : "ai"}
                />
                <div className="message-content group">
                  {message.role === "assistant" && (
                    <div className="response-time">
                      {message.responseTime > 0 ? (
                        <Tooltip title="Response Time">
                          ⏱️ {(message.responseTime / 1000).toFixed(2)}s
                        </Tooltip>
                      ) : (
                        <Tooltip title="Response Time">⏱️ NA</Tooltip>
                      )}
                      <Tooltip
                        title="Response Length"
                        style={{ marginLeft: "10px" }}
                      >
                        📝 {message.content.length} chars
                      </Tooltip>
                      <Tooltip
                        title="Response Consumed"
                        style={{ marginLeft: "10px" }}
                      >
                        📜 {message.responseTokens} tokens
                      </Tooltip>
                    </div>
                  )}
                  {message.role === "assistant" ? (
                    <FormattedMessage
                      content={message.content}
                      isImageGeneration={message.isImageGeneration}
                      imageUrl={message.imageUrl}
                    />
                  ) : (
                    message.content
                  )}
                  <div className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100 transition-opacity duration-100 min-w-[37px]">
                    <Paragraph
                      copyable={{
                        text: message.content,
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
                        padding: "0.7% 0% 0.5% 1%",
                        float: "right",
                        fontSize: "15px",
                      }}
                    />

                    <Popconfirm
                      title="Delete Message"
                      description="Are you sure you want to delete this message?"
                      okText="Delete"
                      cancelText="Cancel"
                      okType="default"
                      onConfirm={() => deleteMessage(message.id)}
                      placement="top"
                      rootClassName="delete-pop-confirm"
                      okButtonProps={{ className: "delete-message-btn" }}
                      cancelButtonProps={{ className: "cancel-message-btn" }}
                    >
                      <Tooltip title="Delete">
                        <DeleteOutlined
                          style={{
                            color: "#84868a",
                            margin: "0.9% 0.3% 0.6% 2%",
                            float: "right",
                            fontSize: "17px",
                          }}
                          className="pr-[3px] pt-[2px]"
                        />
                      </Tooltip>
                    </Popconfirm>

                    {message.role === "assistant" && (
                      <Popconfirm
                        title="Regenerate Response"
                        description="This will delete all messages after this response (if any). Are you sure?"
                        okText="Regenerate"
                        cancelText="Cancel"
                        okType="default"
                        onConfirm={() => handleRegenerate(message.id)}
                        placement="top"
                        rootClassName="delete-pop-confirm"
                        okButtonProps={{ className: "regenerate-btn" }}
                        cancelButtonProps={{ className: "cancel-message-btn" }}
                      >
                        <Tooltip title="Regenerate">
                          <SyncOutlined
                            style={{
                              margin: "1.1% 0% 0.6% 2%",
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
            </div>
          ))}
        </Fragment>
      ))}
      {regeneratingTempStatus === true && (
        <ThinkingIndicator agentType="none" isRegenerating={true} />
      )}
    </>
  );
};
