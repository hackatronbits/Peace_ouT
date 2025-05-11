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
} from "@ant-design/icons";
import { useApp } from "../../../context/AppContext";
import {
  ModelSettings as IModelSettings,
  MODELS,
  DEFAULT_MODEL_SETTINGS,
} from "../../../config/modelConfig";
import { validateModelApiKey } from "../../../config/modelConfig";
import { logInfo, logError } from "../../../utils/logger";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Model Settings",
  description: "Learn about how we protect and handle your data at PromptCue.",
};

const LOCAL_STORAGE_KEYS = {
  MODEL_SETTINGS: "modelSettings",
  API_KEYS: "modelApiKeys",
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

  const handleSettingChange = (setting: keyof IModelSettings, value: any) => {
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
        <Slider
          value={value}
          min={setting.min}
          max={setting.max}
          step={setting.step}
          onChange={(val) => handleSettingChange(key, val)}
        />
      </div>
    );
  };

  const renderApiKeySection = () => {
    if (!selectedModel) return null;

    const hasStoredKey = apiKeys[selectedModel];
    const isEditing = isEditingKey || !hasStoredKey;

    return (
      <Card className="settings-card">
        <div className="card-header">
          <Title level={4}>
            <KeyOutlined className="mr-2" /> Key Management
          </Title>
        </div>
        <div className="card-content">
          {MODELS[selectedModel].authMethod !== "none" ? (
            <>
              <div className="setting-group">
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Text strong>API Key</Text>
                  {isEditing ? (
                    <Input.Password
                      style={{ width: "70%", background: "#141414 !important" }}
                      placeholder="Enter your API key"
                      value={apiKeys[selectedModel] || ""}
                      onChange={(e) =>
                        handleApiKeyChange(selectedModel, e.target.value)
                      }
                    />
                  ) : (
                    <Alert
                      className="key-management"
                      message="API key is set and validated"
                      description={
                        <Button
                          type="link"
                          onClick={() => setIsEditingKey(true)}
                        >
                          Update API key
                        </Button>
                      }
                      type="success"
                      showIcon
                    />
                  )}
                </Space>
              </div>
              {isEditing && (
                <div className="api-key-actions">
                  <Button
                    style={{ marginRight: "2%" }}
                    type="primary"
                    onClick={() => validateApiKey(selectedModel)}
                    loading={isValidating}
                  >
                    {hasStoredKey
                      ? "Update & Validate Key"
                      : "Validate & Save Key"}
                  </Button>
                  {isEditingKey && (
                    <Button
                      style={{ marginRight: "2%" }}
                      onClick={() => {
                        setIsEditingKey(false);
                        // Restore the previous key if exists
                        const storedKeys = localStorage.getItem(
                          LOCAL_STORAGE_KEYS.API_KEYS,
                        );
                        if (storedKeys) {
                          try {
                            const parsedKeys = JSON.parse(storedKeys);
                            setApiKeys(parsedKeys);
                          } catch (error) {
                            console.error(
                              "Error parsing stored API keys:",
                              error,
                            );
                          }
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  {MODELS[selectedModel].keyAcquisitionLink && (
                    <Button
                      type="link"
                      icon={<ExportOutlined />}
                      onClick={() =>
                        window.open(
                          MODELS[selectedModel].keyAcquisitionLink,
                          "_blank",
                        )
                      }
                    >
                      Get API Key
                    </Button>
                  )}
                </div>
              )}
              {validationStatus && (
                <Alert
                  message={validationStatus.message}
                  type={validationStatus.type}
                  showIcon
                  className="mt-4"
                />
              )}
            </>
          ) : (
            <Alert
              message="No API key required for this model"
              type="info"
              showIcon
            />
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <Space align="center" size={16}>
          <SettingOutlined style={{ padding: "4%" }} />
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
            {/* {currentSettings.maxTokens} */}
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
              <Text strong>Response Format</Text>
              <Select
                style={{ float: "right" }}
                value={currentSettings.responseFormat}
                onChange={(value) =>
                  handleSettingChange("responseFormat", value)
                }
              >
                <Option value="text">Plain Text</Option>
                <Option value="markdown">Markdown</Option>
                <Option value="json">JSON</Option>
              </Select>
              <br />
              <br />
            </div>
            <div className="setting-group">
              <Space>
                <Text strong>Custom Instructions</Text>
                <Tooltip title="These instructions will be included with every prompt to guide the model's behavior">
                  <InfoCircleTwoTone className="info-icon" />
                </Tooltip>
              </Space>
              <br />
              <br />
              <TextArea
                className="custom-instructions"
                value={currentSettings.customInstructions}
                onChange={(e) =>
                  handleSettingChange("customInstructions", e.target.value)
                }
                placeholder="Enter any specific instructions for the model..."
                rows={4}
              />
            </div>
          </div>
        </Card>

        {selectedModel && renderApiKeySection()}

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
                <Text className="mt-2 block" style={{ float: "right" }}>
                  {MODELS[selectedModel].description}
                </Text>
              </div>
              <div className="setting-group">
                <Text strong>Features</Text>
                <br />
                <br />
                <div>
                  {MODELS[selectedModel].features?.maxTokens && (
                    <Tag color="blue" className="feature-tags">
                      Max Tokens: {MODELS[selectedModel].features.maxTokens}
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
                  <div>
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
