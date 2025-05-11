import React, { useState } from "react";
import { Modal, Input, Button, message as antMessage } from "antd";
import { useApp } from "../../../context/AppContext";
import { KeyOutlined } from "@ant-design/icons";
import {
  getModelConfig,
  validateModelApiKey,
} from "../../../config/modelConfig";
import "./ApiKeyModal.css";

interface ApiKeyModalProps {
  isVisible: boolean;
  onClose: () => void;
  modelName: string;
  onApiKeyValidated?: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isVisible,
  onClose,
  modelName,
  onApiKeyValidated,
}) => {
  const { setModelApiKey } = useApp();
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const modelConfig = getModelConfig(modelName);

  const handleSave = async () => {
    if (!apiKeyInput.trim()) {
      antMessage.error("Please enter an API key");
      return;
    }

    setIsValidating(true);
    try {
      // Use direct validation from modelConfig
      const isValid = await validateModelApiKey(modelName, apiKeyInput.trim());

      if (isValid) {
        // If valid, save through AppContext
        const saved = await setModelApiKey(modelName, apiKeyInput.trim());

        if (saved) {
          antMessage.success("API key validated and saved successfully");

          // Trigger any additional callback (like sending pending message)
          if (onApiKeyValidated) {
            onApiKeyValidated();
          }

          setApiKeyInput("");
          onClose();
        } else {
          antMessage.error("Failed to save API key");
        }
      } else {
        antMessage.error("Invalid API key. Please check and try again");
      }
    } catch (error) {
      antMessage.error("Error validating API key");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Modal
      title={`Enter API Key for ${modelConfig.name}`}
      open={isVisible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isValidating}
          onClick={handleSave}
          disabled={!apiKeyInput.trim()}
        >
          Save
        </Button>,
      ]}
      className="api-key-modal"
    >
      <div className="api-key-content">
        <p className="description">
          To access {modelConfig.name}, an API Key from{" "}
          {modelConfig.provider.toUpperCase()} is required.
          <br />
          <br />
          Rest assured, your API Key is securely stored locally in your browser
          and is never transmitted elsewhere.
        </p>

        <Input.Password
          prefix={<KeyOutlined />}
          value={apiKeyInput}
          onChange={(e) => setApiKeyInput(e.target.value)}
          placeholder={`Enter your ${modelConfig.provider.toUpperCase()} API key`}
          className="api-key-input"
        />

        {modelConfig.keyAcquisitionLink && (
          <a
            href={modelConfig.keyAcquisitionLink}
            target="_blank"
            rel="noopener noreferrer"
            className="get-key-link"
          >
            🔗 Obtain your API key from the {modelConfig.provider.toUpperCase()}{" "}
            dashboard
          </a>
        )}

        <p className="validation-note">
          The app will establish a connection to the{" "}
          {modelConfig.provider.toUpperCase()} API to authenticate your key.
        </p>
      </div>
    </Modal>
  );
};

export default ApiKeyModal;
