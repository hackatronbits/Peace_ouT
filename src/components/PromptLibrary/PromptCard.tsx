import React, { useState } from "react";
import { Card, Button, Tooltip, Modal, App } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  SendOutlined,
  ExportOutlined,
  PushpinOutlined,
} from "@ant-design/icons";
import { PromptCardProps } from "./types";
import AddCustomPromptModal from "./AddCustomPromptModal";
import "./PromptLibrary.css";

const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  onEdit,
  onDelete,
  onUseNow,
  onTogglePin,
}) => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const { message } = App.useApp();

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(prompt.content);
    message.success("Prompt copied to clipboard");
  };

  const handleUseNow = () => {
    if (onUseNow) {
      onUseNow(prompt);
    }
  };

  const handleTogglePin = () => {
    if (onTogglePin) {
      onTogglePin(prompt);
      message.success(prompt.isPinned ? "Prompt unpinned" : "Prompt pinned");
    }
  };

  return (
    <>
      <Card
        className="prompt-card"
        styles={{
          body: {
            padding: "16px",
          },
        }}
      >
        <div className="prompt-card-header">
          <div className="prompt-card-title">
            {prompt.title.length > 20 ? (
              <Tooltip title={prompt.title}>
                {prompt.title.slice(0, 20)}...
              </Tooltip>
            ) : (
              prompt.title
            )}
          </div>
          <div className="prompt-card-description">
            <small>
              Source:{" "}
              {prompt.source === "ACP" ? (
                <a href="https://github.com/f/awesome-chatgpt-prompts">
                  Awesome ChatGPT Prompts <ExportOutlined />
                </a>
              ) : (
                prompt.source
              )}{" "}
            </small>
          </div>
        </div>

        <div className="prompt-card-actions">
          <div className="prompt-card-actions-left">
            <Tooltip title="Copy Prompt">
              <CopyOutlined
                onClick={handleCopyToClipboard}
                style={{ color: "#666666" }}
              />
            </Tooltip>
            <Tooltip title="Edit Prompt">
              <EditOutlined
                onClick={() => setIsEditModalVisible(true)}
                style={{ color: "#666666" }}
              />
            </Tooltip>
            <Tooltip title="Delete Prompt">
              <DeleteOutlined
                onClick={() => setIsDeleteModalVisible(true)}
                style={{ color: "#666666" }}
              />
            </Tooltip>
            <Tooltip title={prompt.isPinned ? "Unpin Prompt" : "Pin Prompt"}>
              <PushpinOutlined
                onClick={handleTogglePin}
                style={{
                  color: prompt.isPinned ? "#1890ff" : "#666666",
                  transform: prompt.isPinned ? "rotate(-45deg)" : "none",
                }}
              />
            </Tooltip>
          </div>
          <div className="prompt-card-actions-right">
            <Button
              className="use-now-btn"
              onClick={handleUseNow}
              icon={<SendOutlined />}
            >
              Use
            </Button>
          </div>
        </div>
      </Card>

      <AddCustomPromptModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onAdd={(editedPrompt) => {
          onEdit({ ...editedPrompt, id: prompt.id });
          setIsEditModalVisible(false);
        }}
        promptToEdit={prompt}
      />

      <Modal
        title={
          <>
            <DeleteOutlined /> Delete Prompt
          </>
        }
        open={isDeleteModalVisible}
        onOk={() => {
          onDelete(prompt.id);
          setIsDeleteModalVisible(false);
        }}
        okText="Delete"
        onCancel={() => setIsDeleteModalVisible(false)}
        className="prompt-modal"
      >
        <p>
          Are you sure you want to delete <b>{prompt.title}</b> from your prompt
          library?
        </p>
      </Modal>
    </>
  );
};

export default PromptCard;
