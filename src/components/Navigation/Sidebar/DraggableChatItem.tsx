import React, { useRef, useState } from "react";
import { useDrag } from "react-dnd";
import { Button, Tooltip, Dropdown, Tag, MenuProps, Input } from "antd";
import {
  PushpinOutlined,
  MoreOutlined,
  RobotOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { MODELS } from "../../../config/modelConfig";
import { Chat, useApp } from "../../../context/AppContext";
import { featureUsageLogger } from "../../../utils/featureUsageLogger";

interface DraggableChatItemProps {
  chat: Chat;
  isActive: boolean;
  onSelect: () => void;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  menuItems: MenuProps["items"];
  isEditing: boolean;
  onIsEditingTitle: (value: string | null) => void;
}

const DraggableChatItem: React.FC<DraggableChatItemProps> = ({
  chat,
  isActive,
  onSelect,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  menuItems,
  isEditing,
  onIsEditingTitle,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { chats, activeChat, setActiveChat, setChats } = useApp();
  const [editedTitle2, setEditedTitle2] = useState(chat.title);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "chat",
    item: { id: chat.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // Apply the drag ref to our element ref
  drag(ref);

  const formatModelName = (name: string): string => {
    return name
      .split("-")
      .map((part) => {
        if (part.toLowerCase() === "gpt") return "GPT";
        if (!isNaN(Number(part))) return part;
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join(" ");
  };

  const handleTitleSave = async (chatId: string, dismissed: boolean) => {
    if (!dismissed) {
      if (editedTitle2.trim() && editedTitle2.trim() != chat.title) {
        const updatedChat = chats.find((chat) => chat.id === chatId);
        if (updatedChat) {
          updatedChat.title = editedTitle2.trim();

          const updatedChats = chats.map((chat) =>
            chat.id === chatId ? updatedChat : chat,
          );

          localStorage.setItem("PC_chats", JSON.stringify(updatedChats));

          featureUsageLogger({
            featureName: "chat_management",
            eventType: "chat_title_updated",
            eventMetadata: {
              chatId: chatId,
              chatTitle: editedTitle2,
            },
          });

          if (activeChat?.id === chatId) {
            setActiveChat(updatedChat);
          }

          setChats(updatedChats);
        }
      }
    }
    onIsEditingTitle(null);
    setEditedTitle2(chat.title);
  };

  return (
    <div
      ref={ref}
      className={`chat-item ${chat.isPinned ? "pinned" : ""} ${isActive ? "active" : ""} ${isDragging ? "dragging" : ""}`}
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="chat-item-content">
        <div className="chat-header">
          <div className="chat-header-left">
            {chat.messages[0]?.mode === "normal" && chat.model && (
              <div className="chat-model-tag">
                {formatModelName(MODELS[chat.model].name)}
              </div>
            )}
            {chat.messages[0]?.mode === "agent" && (
              <Tag
                style={{
                  background:
                    "linear-gradient(26deg, #5c1d8a 0%, #f68e0f 100%)",
                  boxShadow:
                    "0 2px 6px rgba(92, 29, 138, 0.35), 0 0 4px rgba(246, 142, 15, 0.25)",
                }}
              >
                <RobotOutlined />{" "}
                {chat.messages[0].agentType === "tech" ? "JORDAN" : "SCOTT"}
              </Tag>
            )}
          </div>

          <div className="chat-header-right">
            {chat.isPinned && (
              <Tooltip title="Pinned">
                <PushpinOutlined className="pin-icon" rotate={-45} />
              </Tooltip>
            )}
            {(isHovered || window.innerWidth <= 768) && (
              <Tooltip title="Options">
                <Dropdown
                  menu={{
                    items: menuItems,
                    onClick: (e) => e.domEvent.stopPropagation(),
                  }}
                  trigger={["click"]}
                  placement="bottomLeft"
                >
                  <Button
                    type="text"
                    className="chat-action-button"
                    icon={<MoreOutlined />}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Dropdown>
              </Tooltip>
            )}
          </div>
        </div>

        {isEditing ? (
          <Input
            value={editedTitle2}
            onChange={(e) => setEditedTitle2(e.target.value)}
            autoFocus
            className="title-edit-input"
            suffix={
              <div style={{ display: "flex", gap: "8px" }}>
                {editedTitle2.trim() && editedTitle2.trim() !== chat.title && (
                  <Tooltip title="Save">
                    <CheckOutlined
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTitleSave(chat.id, false);
                      }}
                    />
                  </Tooltip>
                )}

                <Tooltip title="Dismiss">
                  <CloseOutlined
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditedTitle2(chat.title); // Reset to original title
                      handleTitleSave(chat.id, true); // This should toggle editing off
                    }}
                  />
                </Tooltip>
              </div>
            }
          />
        ) : (
          <span className="chat-title">
            {chat.title.length > 30
              ? window.innerWidth <= 768
                ? chat.title.slice(0, 40) + "..."
                : chat.title.slice(0, 25) + "..."
              : chat.title}
          </span>
        )}
        {chat.messages && chat.messages.length > 0 && (
          <div className="chat-preview">
            {chat.messages[chat.messages.length - 1].content.slice(0, 60)}
            {chat.messages[chat.messages.length - 1].content.length > 60
              ? "..."
              : ""}
          </div>
        )}
      </div>
    </div>
  );
};

export default DraggableChatItem;
