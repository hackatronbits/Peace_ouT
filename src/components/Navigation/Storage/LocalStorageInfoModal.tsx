import React, { useEffect, useState } from "react";
import {
  Modal,
  Progress,
  Spin,
  Typography,
  theme,
  Alert,
  Button,
  App,
} from "antd";
import {
  WarningOutlined,
  CloudOutlined,
  DatabaseOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useApp } from "../../../context/AppContext";
import { featureUsageLogger } from "../../../utils/featureUsageLogger";
import "./LocalStorageInfoModal.css";

const { Text, Title } = Typography;

interface LocalStorageInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StorageInfo {
  totalSize: number;
  maxSize: number;
  itemSizes: {
    [key: string]: number;
  };
}

const getBrowserLocalStorageLimit = (): number => {
  const browser = navigator.userAgent.toLowerCase();

  // Default conservative limit (5MB)
  const defaultLimit = 5 * 1024 * 1024;

  // Chrome/Edge (both Chromium-based)
  if (browser.includes("chrome") || browser.includes("edg")) {
    return 10 * 1024 * 1024; // 10MB
  }

  // Firefox
  if (browser.includes("firefox")) {
    return 10 * 1024 * 1024; // 10MB
  }

  // Safari
  if (browser.includes("safari") && !browser.includes("chrome")) {
    return 5 * 1024 * 1024; // 5MB
  }

  // Return default limit for unknown browsers
  return defaultLimit;
};

const LocalStorageInfoModal: React.FC<LocalStorageInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isStorageAvailable, setIsStorageAvailable] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const { token } = theme.useToken();
  const { isDarkMode } = useApp();
  const { message } = App.useApp();

  const checkStorageAvailability = () => {
    try {
      const testKey = "__storage_test__";
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      setIsStorageAvailable(true);
      return true;
    } catch (e) {
      setIsStorageAvailable(false);
      return false;
    }
  };

  const handleStorageFull = async () => {
    setIsClearing(true);
    try {
      // Get all items and their timestamps
      const items: { key: string; size: number; timestamp: number }[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("PC_")) {
          const value = localStorage.getItem(key);
          const size = (key.length + (value?.length || 0)) * 2; // UTF-16 chars are 2 bytes
          let timestamp = 0;
          try {
            const data = JSON.parse(value || "{}");
            timestamp = data.timestamp || 0;
          } catch {
            // If can't parse JSON, treat as oldest
            timestamp = 0;
          }
          items.push({ key, size, timestamp });
        }
      }

      // Sort by timestamp (oldest first)
      items.sort((a, b) => a.timestamp - b.timestamp);

      // Remove oldest items until we free up 1MB
      let freedSpace = 0;
      const targetSpace = 1024 * 1024; // 1MB

      for (const item of items) {
        if (freedSpace >= targetSpace) break;
        localStorage.removeItem(item.key);
        freedSpace += item.size;
      }

      if (freedSpace > 0) {
        message.success("Successfully cleared old data to make space");
        calculateStorageSize().then(setStorageInfo);
      } else {
        message.error(
          "Could not clear enough space. Please manually delete some items.",
        );
      }
    } finally {
      setIsClearing(false);
    }
  };

  const calculateStorageSize = async () => {
    setIsCalculating(true);

    try {
      if (!checkStorageAvailability()) {
        return null;
      }

      const items = {
        chats: localStorage.getItem("PC_chats"),
        promptCueLogs: localStorage.getItem("PC_promptCueLogs"),
        promptLibrary: localStorage.getItem("PC_customPrompts"),
        projectFolders: localStorage.getItem("PC_projectFolders"),
        modelSettings: localStorage.getItem("PC_modelSettings"),
        modelApiKeys: localStorage.getItem("PC_modelApiKeys"),
        selectedModel: localStorage.getItem("PC_selectedModel"),
        chatVariables: localStorage.getItem("PC_chatVariables"),
        darkMode: localStorage.getItem("PC_darkMode"),
        activeChat: localStorage.getItem("PC_activeChat"),
      };

      const itemSizes = Object.entries(items).reduce(
        (acc, [key, value]) => {
          acc[key] = value ? new Blob([value]).size : 0;
          return acc;
        },
        {} as { [key: string]: number },
      );

      const totalSize = Object.values(itemSizes).reduce((a, b) => a + b, 0);
      const maxSize = getBrowserLocalStorageLimit();

      featureUsageLogger({
        featureName: "storage_management",
        eventType: "local_storage_info",
        eventMetadata: {
          itemSizesInBytes: itemSizes,
          totalSize: formatSize(totalSize),
          maxSize: formatSize(maxSize),
          agent: navigator.userAgent.toLowerCase(),
        },
      });

      return {
        totalSize,
        maxSize,
        itemSizes,
      };
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      calculateStorageSize().then(setStorageInfo);
    }
  }, [isOpen]);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <Modal
      title={
        <>
          <DatabaseOutlined /> Local Vault
        </>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      className={`storage-modal ${isDarkMode ? "dark-mode" : ""}`}
      width={700}
    >
      {!isStorageAvailable && (
        <Alert
          message="Browser Storage Not Available"
          description={
            <div>
              <p>
                Your browser doesn&apos;t support or has disabled local storage.
                The app cannot function without local storage.
              </p>
              <p>To fix this:</p>
              <ul>
                <li>
                  If you&apos;re in private/incognito mode, please switch to
                  normal browsing mode
                </li>
                <li>
                  Check if local storage is blocked in your browser settings
                </li>
                <li>
                  Try using a modern browser (Chrome, Firefox, Safari, Edge)
                </li>
                <li>Ensure you have sufficient disk space</li>
                <li>
                  Check if any privacy extensions are blocking local storage
                </li>
              </ul>
              <p>The app will not function until local storage is available.</p>
            </div>
          }
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {storageInfo && storageInfo.totalSize > storageInfo.maxSize && (
        <Alert
          message="Storage Space Running Low"
          description={
            <div>
              <p>
                Your local storage is nearly full. To continue using the app:
              </p>
              <ul>
                <li>
                  Click &quot;Clear Old Data&quot; to automatically remove older
                  items
                </li>
                <li>Manually delete unnecessary chats or data</li>
                <li>Export important data before clearing</li>
              </ul>
              <Button
                type="primary"
                icon={<DeleteOutlined />}
                onClick={handleStorageFull}
                loading={isClearing}
                style={{ marginTop: 8 }}
              >
                Clear Old Data
              </Button>
            </div>
          }
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {(storageInfo || isCalculating) && isStorageAvailable && (
        <div className="storage-info-container">
          <div className="info-section">
            <Title
              level={5}
              style={{ marginBottom: "16px", color: token.colorTextSecondary }}
            >
              Important Information
            </Title>
            <div className="info-list">
              <div className="info-item">
                <CloudOutlined className="info-icon" />
                <Text>
                  Your data is stored locally in your browser&apos;s storage,
                  not on our servers
                </Text>
              </div>
              <div className="info-item">
                <WarningOutlined className="info-icon" />
                <Text>
                  Data may be cleared when you clear browser data or use
                  private/incognito mode
                </Text>
              </div>
            </div>
          </div>
          <div className="storage-overview">
            <Title
              level={5}
              style={{ margin: 0, color: token.colorTextSecondary }}
            >
              Storage Usage{" "}
              {isCalculating && <Spin size="small" style={{ marginLeft: 8 }} />}
            </Title>
            {storageInfo && (
              <div className="storage-progress">
                <Progress
                  percent={Number(
                    (
                      (storageInfo.totalSize / storageInfo.maxSize) *
                      100
                    ).toFixed(1),
                  )}
                  status={
                    storageInfo.totalSize > storageInfo.maxSize
                      ? "exception"
                      : "normal"
                  }
                  strokeColor={token.colorPrimary}
                  trailColor={
                    isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
                  }
                />
                <Text
                  style={{
                    display: "block",
                    textAlign: "center",
                    marginTop: "8px",
                  }}
                >
                  {formatSize(storageInfo.totalSize)} of{" "}
                  {formatSize(storageInfo.maxSize)} used
                </Text>
              </div>
            )}
          </div>
          <div className="storage-stats">
            {Object.entries(storageInfo?.itemSizes || {}).map(([key, size]) => (
              <div key={key} className="stat-card">
                <div className="stat-title">{key}</div>
                <div className="stat-value">{formatSize(size)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default LocalStorageInfoModal;
