"use client";

import React, { useState, useEffect } from "react";
import "./ModelSettings.css";
import {
  Card,
  Select,
  Slider,
  Input,
  Typography,
  Tooltip,
  Button,
  Space,
  Badge,
  Tag,
  Alert,
} from "antd";
import {
  SettingOutlined,
  InfoCircleOutlined,
  ExperimentOutlined,
  ApiOutlined,
  RocketOutlined,
  KeyOutlined,
  ExportOutlined,
  InfoCircleTwoTone,
  EditOutlined,
} from "@ant-design/icons";
import { useApp } from "../../../context/AppContext";
import {
  ModelSettings as IModelSettings,
  MODELS,
  DEFAULT_MODEL_SETTINGS,
  ModelProvider,
} from "../../../config/modelConfig";
import { validateModelApiKey } from "../../../config/modelConfig";
import { logInfo, logError } from "../../../utils/logger";
import { featureUsageLogger } from "../../../utils/featureUsageLogger";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Model Settings",
  description: "Learn about how we protect and handle your data at PromptCue.",
};

const LOCAL_STORAGE_KEYS = {
  MODEL_SETTINGS: "PC_modelSettings",
  API_KEYS: "PC_modelApiKeys",
};

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface SettingDescriptions {
  [key: string]: {
    title: string;
    description: string;
    min?: number;
    max?: number;
    step?: number;
  };
}

const SETTING_DESCRIPTIONS: SettingDescriptions = {
  temperature: {
    title: "Temperature",
    description:
      "Controls randomness in responses. Higher values make output more creative but less focused.",
    min: 0,
    max: 2,
    step: 0.1,
  },
  maxTokens: {
    title: "Maximum Length",
    description:
      "Maximum number of tokens in the response. Higher values allow longer responses.",
    min: 1,
    max: 32000,
    step: 1,
  },
  topP: {
    title: "Top P (Nucleus Sampling)",
    description:
      "Controls diversity of responses. Lower values make output more focused and deterministic.",
    min: 0,
    max: 1,
    step: 0.05,
  },
  frequencyPenalty: {
    title: "Frequency Penalty",
    description:
      "Reduces repetition by penalizing frequently used tokens. Higher values encourage more diverse vocabulary.",
    min: -2,
    max: 2,
    step: 0.1,
  },
  presencePenalty: {
    title: "Presence Penalty",
    description:
      "Encourages the model to talk about new topics. Higher values promote more diverse subjects.",
    min: -2,
    max: 2,
    step: 0.1,
  },
};

export default function ModelSettings() {
  const { selectedModel, setSelectedModel } = useApp();
  const [currentSettings, setCurrentSettings] = useState<IModelSettings>(
    DEFAULT_MODEL_SETTINGS,
  );
  const [selectedVersion, setSelectedVersion] = useState<string>("");
  const [hasChanges, setHasChanges] = useState(false);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize default settings in localStorage if not present
  useEffect(() => {
    const storedSettings = localStorage.getItem(
      LOCAL_STORAGE_KEYS.MODEL_SETTINGS,
    );
    if (!storedSettings) {
      const defaultSettings: Record<string, IModelSettings> = {};
      Object.entries(MODELS).forEach(([modelId, model]) => {
        defaultSettings[modelId] = model.defaultSettings;
      });
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.MODEL_SETTINGS,
        JSON.stringify(defaultSettings),
      );
      logInfo("model", "default_settings_initialized", {
        component: "ModelSettings",
      });
    }
  }, []);

  useEffect(() => {
    if (selectedModel) {
      const model = MODELS[selectedModel];
      // Load settings from localStorage or use defaults
      const storedSettings = localStorage.getItem(
        LOCAL_STORAGE_KEYS.MODEL_SETTINGS,
      );
      if (storedSettings) {
        try {
          const parsedSettings = JSON.parse(storedSettings);
          setCurrentSettings(
            parsedSettings[selectedModel] || model.defaultSettings,
          );
        } catch (error) {
          logError(
            "model",
            "error_loading_settings",
            error instanceof Error
              ? error
              : new Error("Failed to parse settings"),
            {
              component: "ModelSettings",
              metadata: {
                error: error instanceof Error ? error.message : String(error),
              },
            },
          );
          setCurrentSettings(model.defaultSettings);
        }
      } else {
        setCurrentSettings(model.defaultSettings);
      }

      setSelectedVersion(model.versions?.[0] || model.id);

      // Load saved API keys
      const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEYS.API_KEYS);
      if (storedKeys) {
        try {
          const parsedKeys = JSON.parse(storedKeys);
          setApiKeys(parsedKeys);
        } catch (error) {
          logError(
            "model",
            "error_parsing_api_keys",
            error instanceof Error
              ? error
              : new Error("Failed to parse API keys"),
            {
              component: "ModelSettings",
              metadata: {
                error: error instanceof Error ? error.message : String(error),
              },
            },
          );
        }
      }
    }
  }, [selectedModel]);

  const handleSettingChange = async (
    setting: keyof IModelSettings,
    value: any,
  ) => {
    try {
      const newSettings = { ...currentSettings, [setting]: value };
      setCurrentSettings(newSettings);
      setHasChanges(true);

      // Update localStorage
      const storedSettings = localStorage.getItem(
        LOCAL_STORAGE_KEYS.MODEL_SETTINGS,
      );
      const allSettings = storedSettings ? JSON.parse(storedSettings) : {};
      allSettings[selectedModel] = newSettings;
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.MODEL_SETTINGS,
        JSON.stringify(allSettings),
      );

      await featureUsageLogger({
        featureName: "model_settings",
        eventType: "setting_updated",
        eventMetadata: {
          setting,
          value,
          previousValue: currentSettings[setting],
        },
      });

      logInfo("model", "settings_changed", {
        component: "ModelSettings",
        metadata: { setting, value },
      });
    } catch (error) {
      logError(
        "model",
        "error_updating_settings",
        error instanceof Error ? error : new Error("Failed to update settings"),
        {
          component: "ModelSettings",
          metadata: {
            setting,
            value,
            error: error instanceof Error ? error.message : String(error),
          },
        },
      );
    }
  };

  const handleApiKeyChange = (model: string, value: string) => {
    setApiKeys((prev) => ({
      ...prev,
      [model]: value,
    }));
    setValidationStatus(null);
  };

  const validateApiKey = async (model: string) => {
    try {
      setIsValidating(true);
      setValidationStatus(null);

      const isValid = await validateModelApiKey(model, apiKeys[model]);

      if (isValid) {
        // Save to localStorage only if validation succeeds
        const updatedKeys = { ...apiKeys };
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.API_KEYS,
          JSON.stringify(updatedKeys),
        );

        logInfo("model", "api_key_validation", {
          component: "ModelSettings",
          metadata: { status: "success" },
        });
        setValidationStatus({
          message: "API key is valid and has been saved",
          type: "success",
        });
        await featureUsageLogger({
          featureName: "model_settings",
          eventType: "api_key_updated",
          eventMetadata: {
            model,
            keyUpdated: true,
          },
        });
        setIsEditingKey(false);
      } else {
        logInfo("model", "api_key_validation", {
          component: "ModelSettings",
          metadata: { status: "failed" },
        });
        setValidationStatus({
          message: "Invalid API key. Please check and try again",
          type: "error",
        });
        await featureUsageLogger({
          featureName: "model_settings",
          eventType: "api_key_updated_failed",
          eventMetadata: {
            model,
            keyUpdated: false,
          },
        });
      }
    } catch (error) {
      logError(
        "model",
        "api_key_validation_error",
        error instanceof Error
          ? error
          : new Error("Failed to validate API key"),
        {
          component: "ModelSettings",
          metadata: {
            error: error instanceof Error ? error.message : String(error),
          },
        },
      );
      setValidationStatus({
        message: "Error validating API key. Please try again",
        type: "error",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const renderModelSelector = () => (
    <Card className="settings-card">
      <div className="card-header">
        <Title level={4}>
          <ApiOutlined className="mr-2" /> Model Selection
        </Title>
      </div>
      <div className="card-content">
        <div className="setting-group">
          <Text strong>Selected Model</Text>
          <Select
            style={{ float: "right" }}
            value={selectedModel}
            onChange={setSelectedModel}
            className="model-select"
          >
            {Object.values(MODELS).map((model) => (
              <Option key={model.id} value={model.id}>
                <Space>{model.name}</Space>
              </Option>
            ))}
          </Select>
          <br />
          <br />
        </div>
        {selectedModel && MODELS[selectedModel].provider && (
          <div className="setting-group">
            <Text strong>Model Provider</Text>
            <Text style={{ float: "right" }}>
              {MODELS[selectedModel].provider.toUpperCase()}
            </Text>
          </div>
        )}
      </div>
    </Card>
  );

  const renderSliderSetting = (key: keyof IModelSettings, value: number) => {
    const setting = SETTING_DESCRIPTIONS[key];
    if (!setting) return null;

    return (
      <div key={key} className="setting-group">
        <div className="setting-label">
          <Space>
            <Text strong>{setting.title}</Text>
            <Tooltip
              style={{ backgroundColor: "#1e293b", color: "#ffffff" }}
              title={setting.description}
            >
              <InfoCircleTwoTone />
            </Tooltip>
          </Space>
          <Badge
            count={value}
            style={{
              backgroundColor: "#fff",
              color: "#1890ff",
              fontWeight: "600",
              boxShadow: "0 0 0 1px #d9d9d9 inset",
            }}
          />
        </div>
        {(MODELS[selectedModel].provider === ModelProvider.Google ||
          MODELS[selectedModel].provider === ModelProvider.Anthropic ||
          MODELS[selectedModel].provider === ModelProvider.Ollama) &&
        (setting.title === "Frequency Penalty" ||
          setting.title === "Presence Penalty") ? (
          <Text>Model doesn&apos;t support this parameter</Text>
        ) : (
          <Slider
            value={value}
            min={setting.min}
            max={setting.max}
            step={setting.step}
            onChange={(val) => handleSettingChange(key, val)}
          />
        )}
      </div>
    );
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <Space align="center" size={16}>
          <SettingOutlined style={{ fontSize: "20px" }} />
          <div>
            <Title level={2}>Model Settings</Title>
            <Text type="secondary">
              Customize your AI model&apos;s behavior and responses
            </Text>
          </div>
        </Space>
      </div>
      <Alert
        className="settings-alert"
        message="Settings Update"
        description="All changes to model settings are saved automatically and take effect immediately in your next conversation."
        type="info"
        showIcon
        style={{ marginBottom: "20px" }}
      />
      <div className="settings-grid">
        {renderModelSelector()}

        <Card className="settings-card">
          <div className="card-header">
            <Title level={4}>
              <ExperimentOutlined className="mr-2" /> Generation Parameters
            </Title>
          </div>
          <div className="card-content">
            {Object.entries(currentSettings)
              .filter(([key, value]) => typeof value === "number")
              .map(([key, value]) =>
                renderSliderSetting(
                  key as keyof IModelSettings,
                  value as number,
                ),
              )}
          </div>
        </Card>

        <Card className="settings-card">
          <div className="card-header">
            <Title level={4}>
              <RocketOutlined className="mr-2" /> Response Configuration
            </Title>
          </div>
          <div className="card-content">
            <div className="setting-group">
              <Space
                align={isMobile ? "start" : "center"}
                direction={isMobile ? "vertical" : "horizontal"}
              >
                <Text strong>Custom Instructions</Text>
                <Tooltip title="These instructions will be included with every prompt to guide the model's behavior">
                  <InfoCircleTwoTone className="info-icon" />
                </Tooltip>
              </Space>
              <br />
              <br />
              {MODELS[selectedModel].name.includes("Gemini") === true ||
              MODELS[selectedModel].name.includes("DeepSeek") === true ? (
                <Text>Model doesn&apos;t support this parameter</Text>
              ) : (
                <TextArea
                  className="custom-instructions"
                  value={currentSettings.customInstructions}
                  onChange={(e) =>
                    handleSettingChange("customInstructions", e.target.value)
                  }
                  placeholder="Enter any specific instructions for the model..."
                  rows={4}
                />
              )}
            </div>
          </div>
        </Card>

        {selectedModel && (
          <Card className="settings-card">
            <div className="card-header">
              <Title level={4}>
                <KeyOutlined className="mr-2" /> API Key Management
              </Title>
            </div>
            <div className="card-content">
              <Alert
                className="key-management"
                message={
                  <Space
                    align={isMobile ? "start" : "center"}
                    direction={isMobile ? "vertical" : "horizontal"}
                  >
                    <Text>
                      {isEditingKey
                        ? "Add API key for "
                        : "API key status for "}
                      <Text strong>{MODELS[selectedModel].name}</Text>
                    </Text>
                    {!isEditingKey && (
                      <Tag color={apiKeys[selectedModel] ? "#108ee9" : "#f50"}>
                        {apiKeys[selectedModel]
                          ? "Configured"
                          : "Not Configured"}
                      </Tag>
                    )}
                  </Space>
                }
                type="info"
                action={
                  <Space direction={isMobile ? "vertical" : "horizontal"}>
                    {isEditingKey ? (
                      <>
                        <Button
                          type="primary"
                          onClick={() => validateApiKey(selectedModel)}
                          loading={isValidating}
                        >
                          Save Key
                        </Button>
                        <Button onClick={() => setIsEditingKey(false)}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="link"
                        onClick={() => setIsEditingKey(true)}
                        icon={<EditOutlined />}
                      >
                        {apiKeys[selectedModel] ? "Update Key" : "Add Key"}
                      </Button>
                    )}
                  </Space>
                }
              />
              {isEditingKey && (
                <Input.Password
                  placeholder="Enter your API key"
                  value={apiKeys[selectedModel] || ""}
                  onChange={(e) =>
                    handleApiKeyChange(selectedModel, e.target.value)
                  }
                  style={{ marginTop: "16px" }}
                />
              )}
            </div>
          </Card>
        )}

        {selectedModel && (
          <Card className="settings-card">
            <div className="card-header">
              <Title level={4}>
                <InfoCircleOutlined className="mr-2" /> Model Information
              </Title>
            </div>
            <div className="card-content">
              <div className="setting-group">
                <Text strong>Description</Text>
                <br />
                <br />
                <Text className="mt-2 block">
                  {MODELS[selectedModel].description}
                </Text>
              </div>
              <div className="setting-group">
                <Text strong>Features</Text>
                <br />
                <br />
                <div className={isMobile ? "feature-tags-mobile" : ""}>
                  {MODELS[selectedModel].features?.maxTokens && (
                    <Tag color="blue" className="feature-tags">
                      Max Tokens: {MODELS[selectedModel].features.maxTokens}
                    </Tag>
                  )}
                  {MODELS[selectedModel].features?.supportsFineTuning && (
                    <Tag color="red" className="feature-tags">
                      Supports Fine Tuning
                    </Tag>
                  )}
                  {MODELS[selectedModel].features?.supportsStreaming && (
                    <Tag color="green" className="feature-tags">
                      Streaming Support
                    </Tag>
                  )}
                  {MODELS[selectedModel].features?.multilingual && (
                    <Tag color="purple" className="feature-tags">
                      Multilingual
                    </Tag>
                  )}
                </div>
              </div>
              {MODELS[selectedModel].pricing && (
                <div className="setting-group">
                  <Text strong>Pricing</Text>
                  <br />
                  <br />
                  <div className={isMobile ? "feature-tags-mobile" : ""}>
                    <Tag color="orange" className="feature-tags">
                      Input: ${MODELS[selectedModel].pricing.inputTokenPrice}{" "}
                      per 1K tokens
                    </Tag>
                    <Tag color="orange" className="feature-tags">
                      Output: ${MODELS[selectedModel].pricing.outputTokenPrice}{" "}
                      per 1K tokens
                    </Tag>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
