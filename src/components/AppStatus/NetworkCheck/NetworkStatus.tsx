"use client";

import { useEffect, useState } from "react";
import { Modal, Button, Space } from "antd";
import { DisconnectOutlined, ReloadOutlined } from "@ant-design/icons";
import styles from "./NetworkStatus.module.css";
import { logWarning, logInfo } from "../../../utils/logger";

const NetworkStatus = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(!navigator.onLine);

    const handleNetworkChange = () => {
      const isOnline = navigator.onLine;
      if (isOnline) {
        logInfo("network", "connection_restored", {
          component: "NetworkStatus",
          metadata: {
            timestamp: new Date().toISOString(),
          },
        });
      } else {
        logWarning("network", "connection_lost", {
          component: "NetworkStatus",
          metadata: {
            timestamp: new Date().toISOString(),
          },
        });
      }
      setIsVisible(!isOnline);
    };

    window.addEventListener("online", handleNetworkChange);
    window.addEventListener("offline", handleNetworkChange);

    return () => {
      window.removeEventListener("online", handleNetworkChange);
      window.removeEventListener("offline", handleNetworkChange);
    };
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <Modal
      title={null}
      open={isVisible}
      footer={null}
      closable={false}
      maskClosable={false}
      centered
      width={400}
      wrapClassName={styles.networkStatusModal}
    >
      <div className={styles.container}>
        <div className={styles.iconContainer}>
          <div className={styles.pulseCircle} />
          <DisconnectOutlined className={styles.disconnectIcon} />
        </div>

        <h2 className={styles.title}>No Internet Connection</h2>

        <p className={styles.description}>
          Please check your network connection and try again. We&apos;ll
          automatically reconnect when your internet is back.
        </p>

        <Space>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleRetry}
            size="large"
            className={styles.retryButton}
          >
            Try Again
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default NetworkStatus;
