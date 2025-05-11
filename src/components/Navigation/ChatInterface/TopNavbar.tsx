import React, { useEffect, useState, useRef } from "react";
import { Button, Select, Tooltip } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useApp } from "../../../context/AppContext";
import "./TopNavbar.css";
import { ModelProvider, MODELS } from "../../../config/modelConfig";
import Image from "next/image";

interface TopNavbarProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

interface ModelInfo {
  provider: string;
  displayName: string;
  description: string;
  dataFreshness: string;
  maxInput: number;
  maxOutput: number;
  responseSpeed: number;
  comingSoon?: boolean;
}

interface ModelTooltipProps {
  info: ModelInfo;
}

const TopNavbar: React.FC<TopNavbarProps> = ({
  isSidebarCollapsed,
  onToggleSidebar,
}) => {
  const {
    isDarkMode,
    selectedModel,
    setSelectedModel,
    activeChat,
    setActiveChat,
    isTemporaryMode,
    setTemporaryMode,
  } = useApp();

  const isModelSwitchingDisabled =
    activeChat?.messages && activeChat.messages.length > 0;

  useEffect(() => {
    isTemporaryMode === true &&
      localStorage.setItem("PC_selectedModel", selectedModel);
  }, [isTemporaryMode]);

  const handleModelChange = async (value: string) => {
    setSelectedModel(value);
    localStorage.setItem("PC_selectedModel", value);

    if (activeChat && activeChat.messages.length === 0) {
      const updatedChat = {
        ...activeChat,
        model: value,
      };
      setActiveChat(updatedChat);

      // Update in localStorage
      const chats = JSON.parse(localStorage.getItem("PC_chats") || "[]");
      const updatedChats = chats.map((chat: any) =>
        chat.id === activeChat.id ? updatedChat : chat,
      );
      localStorage.setItem("PC_chats", JSON.stringify(updatedChats));
    }
  };

  const [hoveredModelInfo, setHoveredModelInfo] = useState<ModelInfo | null>(
    null,
  );
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearTooltipTimeout = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
  };

  const handleTooltipVisibility = (visible: boolean, info?: ModelInfo) => {
    clearTooltipTimeout();

    if (visible) {
      if (info) setHoveredModelInfo(info);
      setIsTooltipVisible(true);
    } else {
      tooltipTimeoutRef.current = setTimeout(() => {
        setIsTooltipVisible(false);
      }, 100); // Small delay before hiding
    }
  };

  const handleDropdownVisibility = (visible: boolean) => {
    setIsDropdownOpen(visible);
    if (!visible && !isTooltipVisible) {
      setHoveredModelInfo(null);
    }
  };

  const ModelTooltip: React.FC<ModelTooltipProps> = ({ info }) => {
    if (!info) return null;

    return (
      <div
        className="model-info-tooltip"
        onMouseEnter={() => handleTooltipVisibility(true)}
        onMouseLeave={() => handleTooltipVisibility(false)}
      >
        <div className="tooltip-header">
          <div className="provider-model">
            <span className="provider">{info.provider}</span>
            <span className="separator">/</span>
            <span className="model-name">{info.displayName}</span>
          </div>
          <p className="description">{info.description}</p>
        </div>

        <div className="tooltip-stats">
          <div className="stat-row">
            <span className="mode-info-label">Max Input</span>
            <span className="stat-value">
              {info.maxInput.toLocaleString()} tokens
            </span>
          </div>
          <div className="stat-row">
            <span className="mode-info-label">Max Output</span>
            <span className="stat-value">
              {info.maxOutput.toLocaleString()} tokens
            </span>
          </div>
          <div className="stat-row">
            <span className="mode-info-label">Data Freshness</span>
            <span className="stat-value">{info.dataFreshness}</span>
          </div>
          <div className="stat-row">
            <span className="mode-info-label">Response Speed</span>
            <div className="speed-indicator-wrapper">
              {info.provider === "Ollama" ? (
                "Based On Your Machine"
              ) : (
                <>
                  <div className="speed-bars">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`speed-bar ${i < Math.ceil(info.responseSpeed / 10) ? "active" : ""}`}
                      />
                    ))}
                  </div>
                  <span className="stat-value">
                    {info.responseSpeed} token/sec
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const createModelLabel = (
    modelKey: string,
    info: ModelInfo,
    icon: JSX.Element,
  ) =>
    window.innerWidth <= 768 ? (
      <div className="model-option">
        <div className="model-info">
          <div className={`model-icon ${modelKey}`}>{icon}</div>
          <span className="model-name">{info.displayName}</span>
        </div>
        {info.comingSoon && <div className="coming-soon-tag">Coming Soon</div>}
      </div>
    ) : (
      <div
        className="model-option"
        onMouseEnter={() => handleTooltipVisibility(true, info)}
        onMouseLeave={() => handleTooltipVisibility(false)}
      >
        <div className="model-info">
          <div className={`model-icon ${modelKey}`}>{icon}</div>
          <span className="model-name">{info.displayName}</span>
        </div>
        {info.comingSoon && <div className="coming-soon-tag">Coming Soon</div>}
      </div>
    );

  const modelOptions = [
    {
      key: "gpt-4o-mini",
      value: "gpt-4o-mini",
      label: createModelLabel(
        "gpt-4o-mini",
        {
          provider: "OpenAI",
          displayName: String(MODELS["gpt-4o-mini"].name),
          description: String(MODELS["gpt-4o-mini"].description),
          dataFreshness: "October, 2023",
          maxInput: Number(MODELS["gpt-4o-mini"].features?.maxTokens),
          maxOutput: Number(MODELS["gpt-4o-mini"].features?.maxOutput),
          responseSpeed: 70,
        },
        <div className="model-option">
          <div className="model-info">
            <div className={`model-icon ${"gpt4omini"}`}>
              <Image
                src="/openai_icon.svg"
                alt="OpenAI Icon"
                width={20}
                height={20}
              />
            </div>
          </div>
        </div>,
      ),
    },
    {
      key: "gpt-4o",
      value: "gpt-4o",
      label: createModelLabel(
        "gpt-4o",
        {
          provider: "OpenAI",
          displayName: String(MODELS["gpt-4o"].name),
          description: String(MODELS["gpt-4o"].description),
          dataFreshness: "October 2023",
          maxInput: Number(MODELS["gpt-4o"].features?.maxTokens),
          maxOutput: Number(MODELS["gpt-4o"].features?.maxOutput),
          responseSpeed: 77.4,
        },
        <div className="model-option">
          <div className="model-info">
            <div className={`model-icon ${"gpt4o"}`}>
              <Image
                src="/openai_icon.svg"
                alt="OpenAI Icon"
                width={20}
                height={20}
              />
            </div>
          </div>
        </div>,
      ),
    },
    {
      key: "chatgpt-4o-latest",
      value: "chatgpt-4o-latest",
      label: createModelLabel(
        "chatgpt-4o-latest",
        {
          provider: "OpenAI",
          displayName: String(MODELS["chatgpt-4o-latest"].name),
          description: String(MODELS["chatgpt-4o-latest"].description),
          dataFreshness: "October 2023",
          maxInput: Number(MODELS["chatgpt-4o-latest"].features?.maxTokens),
          maxOutput: Number(MODELS["chatgpt-4o-latest"].features?.maxOutput),
          responseSpeed: 77.4,
        },
        <div className="model-option">
          <div className="model-info">
            <div className={`model-icon ${"chatgpt4olatest"}`}>
              <Image
                src="/openai_icon.svg"
                alt="OpenAI Icon"
                width={20}
                height={20}
              />
            </div>
          </div>
        </div>,
      ),
    },
    {
      key: "o1",
      value: "o1",
      label: createModelLabel(
        "o1",
        {
          provider: "OpenAI",
          displayName: String(MODELS["o1"].name),
          description: String(MODELS["o1"].description),
          dataFreshness: "October 2023",
          maxInput: Number(MODELS["o1"].features?.maxTokens),
          maxOutput: Number(MODELS["o1"].features?.maxOutput),
          responseSpeed: 70,
        },
        <div className="model-option">
          <div className="model-info">
            <div className={`model-icon ${"o1"}`}>
              <Image
                src="/openai_icon.svg"
                alt="OpenAI Icon"
                width={20}
                height={20}
              />
            </div>
          </div>
        </div>,
      ),
    },
    {
      key: "o1-mini",
      value: "o1-mini",
      label: createModelLabel(
        "o1-mini",
        {
          provider: "OpenAI",
          displayName: String(MODELS["o1-mini"].name),
          description: String(MODELS["o1-mini"].description),
          dataFreshness: "October 2023",
          maxInput: Number(MODELS["o1-mini"].features?.maxTokens),
          maxOutput: Number(MODELS["o1-mini"].features?.maxOutput),
          responseSpeed: 70,
        },
        <div className="model-option">
          <div className="model-info">
            <div className={`model-icon ${"o1mini"}`}>
              <Image
                src="/openai_icon.svg"
                alt="OpenAI Icon"
                width={20}
                height={20}
              />
            </div>
          </div>
        </div>,
      ),
    },
    {
      key: "gpt-3.5-turbo-0125",
      value: "gpt-3.5-turbo-0125",
      label: createModelLabel(
        "gpt-3.5-turbo-0125",
        {
          provider: "OpenAI",
          displayName: String(MODELS["gpt-3.5-turbo-0125"].name),
          description: String(MODELS["gpt-3.5-turbo-0125"].description),
          dataFreshness: "September 2021",
          maxInput: Number(MODELS["gpt-3.5-turbo-0125"].features?.maxTokens),
          maxOutput: Number(MODELS["gpt-3.5-turbo-0125"].features?.maxOutput),
          responseSpeed: 90,
        },
        <div className="model-option">
          <div className="model-info">
            <div className={`model-icon ${"gpt35turbo0125"}`}>
              <Image
                src="/openai_icon.svg"
                alt="OpenAI Icon"
                width={20}
                height={20}
              />
            </div>
          </div>
        </div>,
      ),
    },
    {
      key: "gemini-2.0-flash-exp",
      value: "gemini-2.0-flash-exp",
      label: createModelLabel(
        "gemini-2.0-flash-exp",
        {
          provider: "Google",
          displayName: String(MODELS["gemini-2.0-flash-exp"].name),
          description: String(MODELS["gemini-2.0-flash-exp"].description),
          dataFreshness: "August 2024",
          maxInput: Number(MODELS["gemini-2.0-flash-exp"].features?.maxTokens),
          maxOutput: Number(MODELS["gemini-2.0-flash-exp"].features?.maxOutput),
          responseSpeed: 80,
        },
        <div className="model-option">
          <div className="model-info">
            <div className={`model-icon ${"gemini20flashexp"}`}>
              <Image
                src="/gemini_icon.svg"
                alt="Gemini Icon"
                width={17}
                height={19}
              />
            </div>
          </div>
        </div>,
      ),
      disabled: false,
    },
    {
      key: "gemini-1.5-pro",
      value: "gemini-1.5-pro",
      label: createModelLabel(
        "gemini-1.5-pro",
        {
          provider: "Google",
          displayName: String(MODELS["gemini-1.5-pro"].name),
          description: String(MODELS["gemini-1.5-pro"].description),
          dataFreshness: "September 2024",
          maxInput: Number(MODELS["gemini-1.5-pro"].features?.maxTokens),
          maxOutput: Number(MODELS["gemini-1.5-pro"].features?.maxOutput),
          responseSpeed: 75,
        },
        <div className="model-option">
          <div className="model-info">
            <div className={`model-icon ${"gemini15pro"}`}>
              <Image
                src="/gemini_icon.svg"
                alt="Gemini Icon"
                width={17}
                height={19}
              />
            </div>
          </div>
        </div>,
      ),
      disabled: false,
    },
    {
      key: "gemini-1.5-flash",
      value: "gemini-1.5-flash",
      label: createModelLabel(
        "gemini15flash",
        {
          provider: "Google",
          displayName: String(MODELS["gemini-1.5-flash"].name),
          description: String(MODELS["gemini-1.5-flash"].description),
          dataFreshness: "September 2024",
          maxInput: Number(MODELS["gemini-1.5-flash"].features?.maxTokens),
          maxOutput: Number(MODELS["gemini-1.5-flash"].features?.maxOutput),
          responseSpeed: 75,
        },
        <div className="model-option">
          <div className="model-info">
            <div className={`model-icon ${"gemini15flash"}`}>
              <Image
                src="/gemini_icon.svg"
                alt="Gemini Icon"
                width={17}
                height={19}
              />
            </div>
          </div>
        </div>,
      ),
      disabled: false,
    },
    {
      key: "claude-3-5-sonnet-20241022",
      value: "claude-3-5-sonnet-20241022",
      label: createModelLabel(
        "claude35sonnet",
        {
          provider: "Anthropic",
          displayName: String(MODELS["claude-3-5-sonnet-20241022"].name),
          description: String(MODELS["claude-3-5-sonnet-20241022"].description),
          dataFreshness: "April 2024",
          maxInput: Number(
            MODELS["claude-3-5-sonnet-20241022"].features?.maxTokens,
          ),
          maxOutput: Number(
            MODELS["claude-3-5-sonnet-20241022"].features?.maxOutput,
          ),
          responseSpeed: 35,
        },
        <div className="model-option">
          <div className="model-info">
            <div className={`model-icon ${"claude35sonnet"}`}>
              <Image
                src="/anthropic_icon.svg"
                alt="Anthropic Icon"
                width={20}
                height={20}
              />
            </div>
          </div>
          {/* <div className="coming-soon-tag">Coming Soon</div> */}
        </div>,
      ),
      disabled: false,
    },
    {
      key: "claude-3-5-haiku-20241022",
      value: "claude-3-5-haiku-20241022",
      label: createModelLabel(
        "claude35haiku",
        {
          provider: "Anthropic",
          displayName: String(MODELS["claude-3-5-haiku-20241022"].name),
          description: String(MODELS["claude-3-5-haiku-20241022"].description),
          dataFreshness: "July 2024",
          maxInput: Number(
            MODELS["claude-3-5-haiku-20241022"].features?.maxTokens,
          ),
          maxOutput: Number(
            MODELS["claude-3-5-haiku-20241022"].features?.maxOutput,
          ),
          responseSpeed: 57,
        },
        <div className="model-option">
          <div className="model-info">
            <div className={`model-icon ${"claude35haiku"}`}>
              <Image
                src="/anthropic_icon.svg"
                alt="Anthropic Icon"
                width={20}
                height={20}
              />
            </div>
          </div>
        </div>,
      ),
      disabled: false,
    },
    {
      key: "claude-3-opus-20240229",
      value: "claude-3-opus-20240229",
      label: createModelLabel(
        "claude3opus",
        {
          provider: "Anthropic",
          displayName: String(MODELS["claude-3-opus-20240229"].name),
          description: String(MODELS["claude-3-opus-20240229"].description),
          dataFreshness: "Aug 2023",
          maxInput: Number(
            MODELS["claude-3-opus-20240229"].features?.maxTokens,
          ),
          maxOutput: Number(
            MODELS["claude-3-opus-20240229"].features?.maxOutput,
          ),
          responseSpeed: 27,
        },
        <div className="model-option">
          <div className="model-info">
            <div className={`model-icon ${"claude3opus"}`}>
              <Image
                src="/anthropic_icon.svg"
                alt="Anthropic Icon"
                width={20}
                height={20}
              />
            </div>
          </div>
        </div>,
      ),
      disabled: false,
    },
    {
      key: "deepseek-chat",
      value: "deepseek-chat",
      label: createModelLabel(
        "deepseekchat",
        {
          provider: "DeepSeek",
          displayName: String(MODELS["deepseek-chat"].name),
          description: String(MODELS["deepseek-chat"].description),
          dataFreshness: "March 2023",
          maxInput: Number(MODELS["deepseek-chat"].features?.maxTokens),
          maxOutput: Number(MODELS["deepseek-chat"].features?.maxOutput),
          responseSpeed: 70,
        },
        <div className="model-option">
          <div className="model-info">
            <div className={`model-icon ${"deepseekchat"}`}>
              <Image
                src="/deepseek_icon.svg"
                alt="DeepSeek Icon"
                width={20}
                height={20}
              />
            </div>
          </div>
        </div>,
      ),
      disabled: false,
    },
    {
      key: "mistral:latest",
      value: "mistral:latest",
      label: createModelLabel(
        "mistral:latest",
        {
          provider: "Ollama",
          displayName: String(MODELS["mistral:latest"].name),
          description: String(MODELS["mistral:latest"].description),
          dataFreshness: "December 2023",
          maxInput: Number(MODELS["mistral:latest"].features?.maxTokens),
          maxOutput: Number(MODELS["mistral:latest"].features?.maxOutput),
          responseSpeed: 80,
        },
        <div className="model-option">
          <div className="model-info">
            <div className={`model-icon ${"mistral:latest"}`}>
              <Image
                src="/ollama_icon.svg"
                alt="Ollama Icon"
                width={17}
                height={20}
              />
            </div>
          </div>
        </div>,
      ),
    },
    {
      key: "mixtral:8x7b",
      value: "mixtral:8x7b",
      label: createModelLabel(
        "mixtral:8x7b",
        {
          provider: "Ollama",
          displayName: String(MODELS["mixtral:8x7b"].name),
          description: String(MODELS["mixtral:8x7b"].description),
          dataFreshness: "December 2023",
          maxInput: Number(MODELS["mixtral:8x7b"].features?.maxTokens),
          maxOutput: Number(MODELS["mixtral:8x7b"].features?.maxOutput),
          responseSpeed: 75,
        },
        <div className="model-option">
          <div className="model-info">
            <div className={`model-icon ${"mixtral:8x7b"}`}>
              <Image
                src="/ollama_icon.svg"
                alt="Ollama Icon"
                width={17}
                height={20}
              />
            </div>
            {/* <span className="model-tag ollama-tag">Local</span> */}
          </div>
        </div>,
      ),
    },
    {
      key: "gemma2:9b",
      value: "gemma2:9b",
      label: createModelLabel(
        "gemma2:9b",
        {
          provider: "Ollama",
          displayName: String(MODELS["gemma2:9b"].name),
          description: String(MODELS["gemma2:9b"].description),
          dataFreshness: "June 2024",
          maxInput: Number(MODELS["gemma2:9b"].features?.maxTokens),
          maxOutput: Number(MODELS["gemma2:9b"].features?.maxOutput),
          responseSpeed: 85,
        },
        <div className="model-option">
          <div className="model-info">
            <div className={`model-icon ${"gemma2:9b"}`}>
              <Image
                src="/ollama_icon.svg"
                alt="Ollama Icon"
                width={17}
                height={20}
              />
            </div>
          </div>
        </div>,
      ),
    },
    {
      key: "llama2:7b",
      value: "llama2:7b",
      label: createModelLabel(
        "llama2:7b",
        {
          provider: "Ollama",
          displayName: String(MODELS["llama2:7b"].name),
          description: String(MODELS["llama2:7b"].description),
          dataFreshness: "July 2023",
          maxInput: Number(MODELS["llama2:7b"].features?.maxTokens),
          maxOutput: Number(MODELS["llama2:7b"].features?.maxOutput),
          responseSpeed: 85,
        },
        <div className="model-option">
          <div className="model-info">
            <div className={`model-icon ${"llama2:7b"}`}>
              <Image
                src="/ollama_icon.svg"
                alt="Ollama Icon"
                width={17}
                height={20}
              />
            </div>
          </div>
        </div>,
      ),
    },
    {
      key: "llama3.3:latest",
      value: "llama3.3:latest",
      label: createModelLabel(
        "llama33:latest",
        {
          provider: "Ollama",
          displayName: String(MODELS["llama3.3:latest"].name),
          description: String(MODELS["llama3.3:latest"].description),
          dataFreshness: "December 2023",
          maxInput: Number(MODELS["llama3.3:latest"].features?.maxTokens),
          maxOutput: Number(MODELS["llama3.3:latest"].features?.maxOutput),
          responseSpeed: 85,
        },
        <div className="model-option">
          <div className="model-info">
            <div className={`model-icon ${"llama33:latest"}`}>
              <Image
                src="/ollama_icon.svg"
                alt="Ollama Icon"
                width={17}
                height={20}
              />
            </div>
          </div>
        </div>,
      ),
    },
  ];

  const modelSelect = (
    <div className="model-selector">
      <Tooltip
        open={isTooltipVisible}
        title={<ModelTooltip info={hoveredModelInfo!} />}
        placement="right"
        classNames={{ root: "model-tooltip-overlay" }}
        destroyTooltipOnHide={true}
        align={{
          offset: [10, 0],
        }}
      >
        <Tooltip
          title={
            isModelSwitchingDisabled ? "Start a new chat to switch models" : ""
          }
          placement="bottom"
        >
          <Select
            size="middle"
            value={
              isTemporaryMode === true
                ? localStorage.getItem("PC_selectedModel")
                : activeChat?.model || selectedModel
            }
            onChange={handleModelChange}
            optionLabelProp="label"
            className="model-select"
            popupClassName={`model-select-dropdown ${isDarkMode ? "dark" : ""}`}
            options={modelOptions}
            disabled={isModelSwitchingDisabled}
            suffixIcon={isModelSwitchingDisabled && <InfoCircleOutlined />}
            listHeight={300}
            virtual={true}
            open={isDropdownOpen || isTooltipVisible}
            onDropdownVisibleChange={handleDropdownVisibility}
          />
        </Tooltip>
      </Tooltip>
    </div>
  );

  const styles = `
    .model-tooltip-overlay {
      pointer-events: auto !important;
    }
    
    .model-tooltip-overlay .ant-tooltip-inner {
      pointer-events: auto !important;
    }
    
    .model-info-tooltip {
      pointer-events: auto !important;
      cursor: default;
      min-width: 250px;
    }

    .model-info-tooltip,
    .model-option {
      transition: opacity 0.3s ease;
    }
  `;

  useEffect(() => {
    return () => clearTooltipTimeout();
  }, []);

  return (
    <>
      <style>{styles}</style>
      <div className={`top-navbar ${isDarkMode ? "dark" : ""}`}>
        <div className="left-section">
          <Button
            type="text"
            icon={
              isSidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
            }
            onClick={onToggleSidebar}
            className="collapse-button"
          />
          {modelSelect}
        </div>
        <div className="right-section">
          {(!activeChat || activeChat.messages.length === 0) && (
            <>
              {window.innerWidth <= 768 ? (
                <Tooltip
                  title={
                    isTemporaryMode
                      ? "Exit Ephemeral Chat"
                      : "Start Ephemeral Chat"
                  }
                >
                  <Button
                    className={`temp-chat-toggle ${isTemporaryMode ? "active" : ""}`}
                    onClick={() => setTemporaryMode(!isTemporaryMode)}
                    icon={<ClockCircleOutlined />}
                  ></Button>
                </Tooltip>
              ) : (
                <div className="temp-chat-feature">
                  <div
                    className={`temp-chat-container ${isTemporaryMode ? "active" : ""}`}
                  >
                    <div className="feature-icon">
                      <ClockCircleOutlined />
                      <div className="timer-ring" />
                    </div>

                    <div className="feature-content">
                      <div className="feature-title">Temporary Chat</div>
                      <div className="feature-description">
                        {isTemporaryMode
                          ? "Ephemeral Chat Mode Activated"
                          : "Activate Ephemeral Chat Mode"}
                      </div>
                    </div>

                    <div className="feature-toggle">
                      <div
                        className={`toggle-switch ${isTemporaryMode ? "active" : ""}`}
                        onClick={() => setTemporaryMode(!isTemporaryMode)}
                      >
                        <div className="toggle-handle" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default TopNavbar;
