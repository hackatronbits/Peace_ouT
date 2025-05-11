import React, { Fragment } from "react";
import { UserOutlined } from "@ant-design/icons";
import { useApp } from "../../../context/AppContext";
import { Avatar } from "antd";
import Image from "next/image";

interface MessageAvatarProps {
  sender: "user" | "ai";
}

const ModelIcons = {
  "gpt-4o-mini": () => {
    return (
      <Image src="/openai_icon.svg" alt="OpenAI Icon" width={15} height={15} />
    );
  },
  "gpt-4o": () => {
    return (
      <Image src="/openai_icon.svg" alt="OpenAI Icon" width={15} height={15} />
    );
  },
  "chatgpt-4o-latest": () => {
    return (
      <Image src="/openai_icon.svg" alt="OpenAI Icon" width={15} height={15} />
    );
  },
  o1: () => {
    return (
      <Image src="/openai_icon.svg" alt="OpenAI Icon" width={15} height={15} />
    );
  },
  "o1-mini": () => {
    return (
      <Image src="/openai_icon.svg" alt="OpenAI Icon" width={15} height={15} />
    );
  },
  "gpt-3.5-turbo-0125": () => {
    return (
      <Image src="/openai_icon.svg" alt="OpenAI Icon" width={15} height={15} />
    );
  },
  "gemini-2.0-flash-exp": () => {
    return (
      <Image src="/gemini_icon.svg" alt="Gemini Icon" width={12} height={14} />
    );
  },
  "gemini-1.5-pro": () => {
    return (
      <Image src="/gemini_icon.svg" alt="Gemini Icon" width={12} height={14} />
    );
  },
  "gemini-1.5-flash": () => {
    return (
      <Image src="/gemini_icon.svg" alt="Gemini Icon" width={12} height={14} />
    );
  },
  "claude-3-5-sonnet-20241022": () => {
    return (
      <Image
        src="/anthropic_icon.svg"
        alt="Anthropic Icon"
        width={15}
        height={15}
      />
    );
  },
  "claude-3-5-haiku-20241022": () => {
    return (
      <Image
        src="/anthropic_icon.svg"
        alt="Anthropic Icon"
        width={15}
        height={15}
      />
    );
  },
  "claude-3-opus-20240229": () => {
    return (
      <Image
        src="/anthropic_icon.svg"
        alt="Anthropic Icon"
        width={15}
        height={15}
      />
    );
  },
  "deepseek-chat": () => {
    return (
      <Image
        src="/deepseek_icon.svg"
        alt="DeepSeek Icon"
        width={15}
        height={15}
      />
    );
  },
  "mistral:latest": () => {
    return (
      <Image src="/ollama_icon.svg" alt="Ollama Icon" width={12} height={15} />
    );
  },
  "mixtral:8x7b": () => {
    return (
      <Image src="/ollama_icon.svg" alt="Ollama Icon" width={12} height={15} />
    );
  },
  "gemma2:9b": () => {
    return (
      <Image src="/ollama_icon.svg" alt="Ollama Icon" width={12} height={15} />
    );
  },
  "llama2:7b": () => {
    return (
      <Image src="/ollama_icon.svg" alt="Ollama Icon" width={12} height={15} />
    );
  },
  "llama3.3:latest": () => {
    return (
      <Image src="/ollama_icon.svg" alt="Ollama Icon" width={12} height={15} />
    );
  },
};

const MessageAvatar: React.FC<MessageAvatarProps> = ({ sender }) => {
  const { activeChat, mode, agentType, isTemporaryMode } = useApp();

  const getModelIcon = () => {
    const model =
      isTemporaryMode === true
        ? localStorage.getItem("PC_selectedModel")
        : activeChat?.model || "gpt-4o-mini";
    const IconComponent =
      ModelIcons[model as keyof typeof ModelIcons] || ModelIcons["gpt-4o-mini"];
    return IconComponent();
  };

  // Handle AI Agent avatars
  if (sender === "ai" && mode === "agent") {
    switch (agentType) {
      case "research":
        return (
          <div className={`message-avatar ${sender}`}>
            <Avatar
              src="/research_agent_Scott.png"
              style={{
                backgroundColor: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "25px",
              }}
            />
          </div>
        );
      case "tech":
        return (
          <div className={`message-avatar ${sender}`}>
            <Avatar
              src="/tech_agent_jordan.png"
              style={{
                backgroundColor: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "25px",
              }}
            />
          </div>
        );
    }
  }

  return (
    <div className={`message-avatar ${sender}`}>
      {sender === "user" ? (
        <UserOutlined />
      ) : (
        <div
          className={`ai-avatar ${isTemporaryMode === true ? localStorage.getItem("PC_selectedModel")?.replace(/[-\.]/g, "") : String(activeChat?.model).replace(/[-\.]/g, "")}`}
        >
          {getModelIcon()}
        </div>
      )}
    </div>
  );
};

export default MessageAvatar;
