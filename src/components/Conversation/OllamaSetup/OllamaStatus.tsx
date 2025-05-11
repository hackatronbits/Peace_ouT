import React, { useEffect, useState, useRef, useCallback } from "react";
import { Alert, App, Button, Modal, Typography } from "antd";
import { AppleFilled, DownloadOutlined } from "@ant-design/icons";
import {
  checkOllamaConnection,
  OllamaConnectionStatus,
} from "../../../utils/ollamaUtils";
import { ModelConfig } from "../../../config/modelConfig";
import { useApp } from "../../../context/AppContext";
import "./OllamaStatus.css";
import Link from "next/link";
import Image from "next/image";
import { isMacOS } from "../../../utils/platformUtils";

interface OllamaStatusProps {
  modelConfig: ModelConfig;
  onConnectionChange?: (status: boolean) => void;
  autoCheck?: boolean;
}

export const OllamaStatus: React.FC<OllamaStatusProps> = ({
  modelConfig,
  onConnectionChange,
  autoCheck = false,
}) => {
  const [connectionStatus, setConnectionStatus] =
    useState<OllamaConnectionStatus>({ isConnected: false });
  const [isChecking, setIsChecking] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
  const [lastConnectedModel, setLastConnectedModel] = useState<string | null>(
    null,
  );
  const [hadPreviousFailure, setHadPreviousFailure] = useState(false);
  const checkInterval = useRef<NodeJS.Timeout | null>(null);
  const prevConnectionStatus = useRef<boolean>(false);
  const { isDarkMode, startNewChat } = useApp();
  const { message } = App.useApp();

  const checkConnection = useCallback(
    async (showSuccessMessage = false) => {
      if (!modelConfig?.id) {
        return;
      }
      setIsChecking(true);
      setShowModal(false); // Hide modal while checking
      const status = await checkOllamaConnection(modelConfig);
      setConnectionStatus(status);
      onConnectionChange?.(status.isConnected);
      setIsChecking(false);
      setLastCheckTime(new Date());

      // Update connection status and handle success message
      if (status.isConnected) {
        if (
          showSuccessMessage &&
          (!prevConnectionStatus.current || hadPreviousFailure)
        ) {
          message.success(
            `Connected to ${modelConfig.name} on your machine`,
            2,
          );
        }
        setHadPreviousFailure(false);
        setLastConnectedModel(modelConfig.id);
        prevConnectionStatus.current = true;
      } else {
        setLastConnectedModel(null);
        setHadPreviousFailure(true);
        prevConnectionStatus.current = false;
      }

      return status;
    },
    [modelConfig?.id, modelConfig?.name, message, onConnectionChange],
  );

  // Start periodic checks if autoCheck is enabled
  useEffect(() => {
    if (autoCheck && modelConfig?.id) {
      // Initial check with success message
      checkConnection(true);

      // Set up periodic check without success message
      checkInterval.current = setInterval(() => checkConnection(false), 30000);

      return () => {
        if (checkInterval.current) {
          clearInterval(checkInterval.current);
          checkInterval.current = null;
        }
      };
    } else {
      // Clean up interval if autoCheck is disabled
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
        checkInterval.current = null;
      }
    }
  }, [autoCheck, modelConfig?.id, checkConnection]);

  // Reset states when model changes
  useEffect(() => {
    setConnectionStatus({ isConnected: false });
    setLastCheckTime(null);
    setLastConnectedModel(null);
    setHadPreviousFailure(false);
    prevConnectionStatus.current = false;
    checkConnection(true); // Show success message for initial check after model change
  }, [modelConfig.id, checkConnection]);

  // Handle connection status changes
  useEffect(() => {
    if (!lastCheckTime || isChecking) return;

    if (connectionStatus.error) {
      setShowModal(true);
    }
  }, [connectionStatus, isChecking, lastCheckTime]);

  const handleModalClose = () => {
    startNewChat();
    setShowModal(false);
  };

  const handleModelPull = async (modelName: string) => {
    if (!modelConfig.ollamaConfig) return;

    setIsPulling(true);
    const { endpoint, port } = modelConfig.ollamaConfig;

    try {
      const response = await fetch(`http://${endpoint}:${port}/api/pull`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: modelName,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to pull model: ${response.statusText}`);
      }

      // After successful pull, check connection again
      await checkConnection();
      if (connectionStatus.isConnected) {
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error pulling model:", error);
      message.error(
        "Failed to pull model. Please try using the terminal command instead.",
      );
    } finally {
      setIsPulling(false);
    }
  };

  const getModelSize = (modelId: string): string => {
    switch (modelId) {
      case "mixtral:8x7b":
        return "26 GB";
      case "mistral:latest":
        return "4.1 GB";
      case "gemma2:9b":
        return "5.4 GB";
      case "llama2:7b":
        return "3.8 GB";
      case "llama3.3:latest":
        return "43 GB";
      default:
        return "3-45 GB";
    }
  };

  const handleRetry = async () => {
    message.info("Trying to re-connect to local Ollama", 3);
    await checkConnection();
    if (connectionStatus.isConnected) {
      setShowModal(false);
    }
  };

  return (
    <>
      {showModal && (
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Image src="/ollama_icon.svg" alt="" width={20} height={25} />
              Ollama Connection Issue
            </div>
          }
          open={showModal}
          onCancel={handleModalClose}
          footer={[
            <Button key="cancel" onClick={handleModalClose}>
              Cancel
            </Button>,
            <Button
              key="retry"
              type="primary"
              onClick={handleRetry}
              loading={isChecking}
            >
              Retry Connection
            </Button>,
          ]}
        >
          <div style={{ marginBottom: "16px" }}>
            <Alert
              message={connectionStatus.error}
              description={connectionStatus.details}
              type="error"
              showIcon
            />
          </div>

          {connectionStatus.error?.includes("not installed") ? (
            <div style={{ marginBottom: 24 }}>
              <Typography.Text>
                <p>
                  The model {modelConfig.name} must be downloaded before use.
                  Please note that the model is approximately{" "}
                  <b>{getModelSize(modelConfig.id)}</b> in size.
                </p>
                <div className="ollama-code-block" style={{ marginTop: 12 }}>
                  <p>
                    <b>Option 1:</b> Run in terminal (recommended for large
                    downloads)
                  </p>
                  <code>
                    ollama pull{" "}
                    {modelConfig.id.includes("ollama-")
                      ? modelConfig.id.replace("ollama-", "")
                      : modelConfig.id}
                  </code>
                  <p style={{ marginTop: 12 }}>
                    <b>Option 2:</b> Use the &quot;Pull Model&quot; button below
                  </p>
                </div>
              </Typography.Text>
            </div>
          ) : (
            <div style={{ marginBottom: 24 }}>
              <Typography.Text>
                PromptCue enables seamless integration with local Ollama AI
                models, allowing you to run them directly on your machine for
                enhanced privacy and optimized performance. For detailed setup
                instructions, please refer to our{" "}
                <Link href="/docs/" target="_blank">
                  <b>our documentation</b>
                </Link>
                .
                {isMacOS() && (
                  <div className="macos-note">
                    <div className="macos-note-title">
                      <AppleFilled />
                      <span>
                        <b>MacOS Note</b>
                      </span>
                    </div>
                    <div className="macos-note-content">
                      Due to Apple&apos;s browser security restrictions, HTTPS
                      is required to use Ollama with PromptCue. Please follow
                      the steps below to configure HTTPS and ensure a seamless
                      experience:
                      <ol style={{ marginTop: "8px", paddingLeft: "20px" }}>
                        <li>
                          Install the SSL proxy library like{" "}
                          <code>local-ssl-proxy</code>:
                          <pre>npm install -g local-ssl-proxy</pre>
                        </li>
                        <li>Start Ollama normally (it runs on port 11434)</li>
                        <li>
                          In a new terminal, run the proxy:
                          <pre>
                            local-ssl-proxy --source 11435 --target 11434
                          </pre>
                        </li>
                      </ol>
                      <div style={{ marginTop: "8px" }}>
                        The proxy will create a secure connection between
                        PromptCue and your local Ollama instance.
                      </div>
                    </div>
                  </div>
                )}
              </Typography.Text>
            </div>
          )}

          {connectionStatus.error?.includes("not installed") && (
            <div className="action-buttons">
              <Button
                type="primary"
                onClick={() =>
                  handleModelPull(
                    modelConfig.id.includes("ollama-")
                      ? modelConfig.id.replace("ollama-", "")
                      : modelConfig.id,
                  )
                }
                loading={isPulling}
                disabled={isPulling}
                icon={!isPulling && <DownloadOutlined />}
              >
                {isPulling ? "Pulling Model..." : `Pull ${modelConfig.name}`}
              </Button>
            </div>
          )}
        </Modal>
      )}

      {/* Show warning alert when connection is lost */}
      {!connectionStatus.isConnected && lastConnectedModel && (
        <Alert
          message="Ollama Connection Lost"
          description="Unable to connect to Ollama. Messages cannot be sent until connection is restored."
          type="warning"
          showIcon
          closable
          className="ollama-status-alert"
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

// Export a function to check connection status
export const checkOllamaConnectionStatus = async (
  modelConfig: ModelConfig,
): Promise<OllamaConnectionStatus> => {
  return await checkOllamaConnection(modelConfig);
};
