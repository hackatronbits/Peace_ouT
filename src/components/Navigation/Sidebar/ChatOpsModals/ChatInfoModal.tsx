import React from "react";
import { Modal } from "antd";
import {
  MessageOutlined,
  RobotOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

interface ChatInfoModalProps {
  visible: boolean;
  onClose: () => void;
  chatInfo: {
    title: string;
    model: string;
    messagesCount: number;
    size: number;
    createdAt: string;
    agentType: string;
  } | null;
}

export const ChatInfoModal: React.FC<ChatInfoModalProps> = ({
  visible,
  onClose,
  chatInfo,
}) => {
  return (
    <Modal
      title={null}
      open={visible}
      footer={null}
      onCancel={onClose}
      className="chat-info-modal"
      width={480}
    >
      {chatInfo && (
        <div className="chat-info-content">
          <div className="info-header">
            <h2>Chat Details</h2>
          </div>

          <div className="title-section">
            <div className="title-icon">
              <MessageOutlined />
            </div>
            <div className="title-content">
              <h3>Chat Title</h3>
              <p>{chatInfo.title}</p>
            </div>
          </div>

          <div className="model-section">
            <div className="model-label">
              {chatInfo.agentType !== "na" && "AI AGENT | "}AI Model
            </div>
            <div className="model-value">
              <RobotOutlined />
              {chatInfo.agentType === "tech"
                ? "Jordan |"
                : chatInfo.agentType === "research"
                  ? "Scott |"
                  : ""}{" "}
              {chatInfo.model}
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{chatInfo.messagesCount}</div>
              <div className="stat-label">Messages</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{chatInfo.size.toFixed(2)}</div>
              <div className="stat-label">KB Used</div>
            </div>
          </div>

          <div className="created-at">
            <CalendarOutlined />
            Created on {chatInfo.createdAt}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ChatInfoModal;
