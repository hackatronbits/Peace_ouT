import React, { useState, useRef, useCallback, useMemo } from "react";
import { Button, Input, Tooltip, Card, Tag, Dropdown, Modal, App } from "antd";
import {
  FolderFilled,
  EditOutlined,
  DeleteOutlined,
  RobotOutlined,
  PushpinOutlined,
  MoreOutlined,
  FolderOpenFilled,
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useApp } from "../../../../context/AppContext";
import type { Chat, ProjectFolder } from "../../../../context/AppContext";
import { useDrop } from "react-dnd";
import { MODELS } from "../../../../config/modelConfig";
import { getFolderMenuItems } from "../../../../utils/chatUtils";
import { featureUsageLogger } from "../../../../utils/featureUsageLogger";
import ChatInfoModal from "../ChatOpsModals/ChatInfoModal";
import { ChatInfo } from "../../../../utils/chatUtils";
import MoveFolderModal from "../ChatOpsModals/MoveFolderModal";

interface ProjectFolderBlockProps {
  folder: ProjectFolder;
  handleChatClick: (chatId: string, type: string) => void;
}

const ProjectFolderBlock: React.FC<ProjectFolderBlockProps> = ({
  folder,
  handleChatClick,
}) => {
  const {
    chats,
    activeChat,
    deleteProjectFolder,
    renameProjectFolder,
    toggleFolderExpansion,
    addChatToFolder,
    removeChatFromFolder,
    exportChat,
    startNewChat,
    deleteChat,
    setChats,
    setActiveChat,
    projectFolders,
  } = useApp();
  const { message } = App.useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(folder.name);
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteFolderModalVisible, setDeleteFolderModalVisible] =
    useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [selectedChatInfo, setSelectedChatInfo] = useState<ChatInfo | null>(
    null,
  );
  const [moveFolderModalVisible, setMoveFolderModalVisible] = useState(false);
  const [selectedChatForMove, setSelectedChatForMove] = useState<string | null>(
    null,
  );
  const ref = useRef<HTMLDivElement>(null);

  const handleRename = () => {
    if (editedName.trim()) {
      renameProjectFolder(folder.id, editedName.trim());
      setIsEditing(false);
    }
  };

  const handleAddNewChat = async () => {
    startNewChat(folder.id);
  };

  const handleChatClickLocal = (chatId: string, type: string) => {
    handleChatClick(chatId, type);
  };

  const handleTitleSave = async (chatId: string) => {
    if (editedTitle.trim()) {
      const updatedChat = chats.find((chat) => chat.id === chatId);
      if (updatedChat) {
        updatedChat.title = editedTitle.trim();

        const updatedChats = chats.map((chat) =>
          chat.id === chatId ? updatedChat : chat,
        );

        localStorage.setItem("PC_chats", JSON.stringify(updatedChats));

        await featureUsageLogger({
          featureName: "chat_management",
          eventType: "chat_title_updated",
          eventMetadata: {
            chatId: chatId,
            chatTitle: editedTitle,
          },
        });

        if (activeChat?.id === chatId) {
          setActiveChat(updatedChat);
        }

        setChats(updatedChats);
      }
    }
    setIsEditingTitle(null);
    setEditedTitle("");
  };

  const handleStartRename = (chatId: string) => {
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      setIsEditingTitle(chatId);
      setEditedTitle(chat.title);
    }
  };

  const handleStartDelete = (chatId: string) => {
    setDeleteModalVisible(true);
    setChatToDelete(chatId);
  };

  const handleInfoClick = useCallback((chatInfo: ChatInfo) => {
    setSelectedChatInfo(chatInfo);
    setInfoModalVisible(true);
  }, []);

  const handleDrop = useCallback(
    (item: { id: string }) => {
      addChatToFolder(folder.id, item.id);
    },
    [folder.id, addChatToFolder],
  );

  const [{ isOver }, dropRef] = useDrop({
    accept: "chat",
    drop: handleDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

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

  // Apply the drop ref to our element ref
  dropRef(ref);

  // Get chats in this folder and separate pinned from unpinned
  const folderChats = chats.filter((chat) => folder.chatIds.includes(chat.id));
  const { pinnedChats, unpinnedChats } = useMemo(() => {
    const pinned = folderChats.filter((chat) => chat.isPinned);
    const unpinned = folderChats.filter((chat) => !chat.isPinned);
    return { pinnedChats: pinned, unpinnedChats: unpinned };
  }, [folderChats]);

  const cardStyle = {
    marginBottom: 8,
    backgroundColor: "#2d3135",
    width: "100%",
    border: isOver ? "1px dashed #1890ff" : "none",
  };

  const handleChatPin = useCallback(
    (chatId: string) => {
      const chat = chats.find((c) => c.id === chatId);
      if (chat) {
        const updatedChat = { ...chat, isPinned: !chat.isPinned };
        const updatedChats = chats.map((c) =>
          c.id === chatId ? updatedChat : c,
        );
        setChats(updatedChats);
        localStorage.setItem("PC_chats", JSON.stringify(updatedChats));
      }
    },
    [chats, setChats],
  );

  const handleMoveToFolder = (folderId: string) => {
    if (selectedChatForMove) {
      // Remove from current folder first
      removeChatFromFolder(folder.id, selectedChatForMove);

      // Add to new folder
      addChatToFolder(folderId, selectedChatForMove);

      // Close the modal
      setMoveFolderModalVisible(false);
      setSelectedChatForMove(null);
    }
  };

  const chatMenuItems = useCallback(
    (chat: Chat) =>
      getFolderMenuItems({
        chat,
        exportChat,
        folderId: folder.id,
        removeChatFromFolder,
        onInfoClick: handleInfoClick,
        onRename: handleStartRename,
        onDeleteClick: handleStartDelete,
        togglePinChat: handleChatPin,
        projectFolders: projectFolders, // Add this line
        onMoveToFolder: () => {
          // Open move to folder modal
          setMoveFolderModalVisible(true);
          setSelectedChatForMove(chat.id);
        },
      }),
    [
      exportChat,
      folder.id,
      removeChatFromFolder,
      handleInfoClick,
      handleChatPin,
      projectFolders,
    ],
  );

  const renderChatItem = (chat: Chat) => {
    const isActive = activeChat?.id === chat.id;

    return (
      <div
        key={chat.id}
        className={`chat-item ${chat.isPinned ? "pinned" : ""} ${isActive ? "active" : ""}`}
        onClick={() => handleChatClickLocal(chat.id, "existing")}
        onMouseEnter={() => setHoveredChatId(chat.id)}
        onMouseLeave={() => setHoveredChatId(null)}
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
              {(hoveredChatId === chat.id || window.innerWidth <= 768) && (
                <Tooltip title="Options">
                  <Dropdown
                    menu={{
                      items: chatMenuItems(chat),
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

          {isEditingTitle === chat.id ? (
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onPressEnter={() => handleTitleSave(chat.id)}
              onBlur={() => handleTitleSave(chat.id)}
              autoFocus
              size="small"
              style={{ width: window.innerWidth <= 768 ? 250 : 150 }}
              suffix={
                <div style={{ display: "flex", gap: "8px" }}>
                  {editedTitle.trim() && editedTitle.trim() !== chat.title && (
                    <Tooltip title="Save">
                      <CheckOutlined
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTitleSave(chat.id);
                        }}
                      />
                    </Tooltip>
                  )}

                  <Tooltip title="Dismiss">
                    <CloseOutlined
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditedTitle(chat.title); // Reset to original title
                        handleTitleSave(chat.id); // This should toggle editing off
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

  const folderContent = (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Button
            type="text"
            size="middle"
            icon={
              folder.isExpanded ? (
                <FolderOpenFilled style={{ fontSize: "20px" }} />
              ) : (
                <FolderFilled style={{ fontSize: "20px" }} />
              )
            }
            onClick={() => toggleFolderExpansion(folder.id)}
            style={{ padding: 0, backgroundColor: "unset !important" }}
          />

          {isEditing ? (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onPressEnter={handleRename}
                autoFocus
                size="small"
                style={{ width: 180 }}
                suffix={
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    {editedName.trim() && editedName.trim() !== folder.name && (
                      <Tooltip title="Rename">
                        <CheckOutlined
                          onClick={handleRename}
                          style={{ cursor: "pointer" }}
                        />
                      </Tooltip>
                    )}
                    <Tooltip title="Dismiss">
                      <CloseOutlined
                        onClick={() => {
                          setIsEditing(false);
                          setEditedName(folder.name);
                        }}
                        style={{ cursor: "pointer" }}
                      />
                    </Tooltip>
                  </div>
                }
              />
            </div>
          ) : (
            <Tooltip title={folder.name.length > 14 ? folder.name : ""}>
              <span
                onClick={() => toggleFolderExpansion(folder.id)}
                style={{ cursor: "pointer" }}
              >
                {folder.name.length > 14
                  ? `${folder.name.slice(0, 14)}...`
                  : folder.name}
              </span>
            </Tooltip>
          )}
        </div>
        {!isEditing && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            ({folderChats.length})
            <Tooltip title="Add New Chat">
              <PlusOutlined
                onClick={handleAddNewChat}
                style={{ cursor: "pointer" }}
              />
            </Tooltip>
            <Tooltip title="Rename">
              <EditOutlined
                onClick={() => setIsEditing(true)}
                style={{ cursor: "pointer" }}
              />
            </Tooltip>
            <Tooltip title="Delete">
              <DeleteOutlined
                onClick={() => {
                  if (folder.chatIds.length > 0) {
                    setDeleteFolderModalVisible(true);
                  } else {
                    deleteProjectFolder(folder.id);
                    message.success("Empty folder deleted successfully");
                  }
                }}
                style={{ cursor: "pointer" }}
              />
            </Tooltip>
          </div>
        )}
      </div>

      <div
        style={{
          height: folder.isExpanded ? "auto" : 0,
          opacity: folder.isExpanded ? 1 : 0,
          overflow: "hidden",
          transition: "height 0.2s ease-in-out, opacity 0.2s ease-in-out",
          marginTop: folder.isExpanded ? 8 : 0,
          paddingLeft: 24,
          transformOrigin: "top",
        }}
      >
        {folderChats.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "rgba(255, 255, 255, 0.45)",
              padding: 10,
              border: "1px dashed #94a3b8",
              borderRadius: "10px",
            }}
          >
            Empty folder
          </div>
        ) : (
          <>
            {pinnedChats.length > 0 && (
              <div style={{ marginBottom: "12px" }}>
                {pinnedChats.map(renderChatItem)}
              </div>
            )}
            {unpinnedChats.map(renderChatItem)}
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <ChatInfoModal
        visible={infoModalVisible}
        onClose={() => setInfoModalVisible(false)}
        chatInfo={selectedChatInfo}
      />
      <Modal
        title={
          <div>
            <span>
              <DeleteOutlined /> Delete Chat
            </span>
          </div>
        }
        open={deleteModalVisible}
        onOk={() => {
          if (chatToDelete) {
            deleteChat(chatToDelete);
            message.success("Chat deleted successfully");
          }
          setDeleteModalVisible(false);
          setChatToDelete(null);
        }}
        okText="Delete"
        onCancel={() => {
          setDeleteModalVisible(false);
          setChatToDelete(null);
        }}
      >
        <p>
          This action is permanent and cannot be undone. The chat will be
          removed from local/cloud storage, and you will not be able to recover
          it. <br /> <br /> Are you sure you want to delete this chat?
        </p>
      </Modal>
      <MoveFolderModal
        visible={moveFolderModalVisible}
        onClose={() => {
          setMoveFolderModalVisible(false);
          setSelectedChatForMove(null);
        }}
        folders={projectFolders}
        onMoveToFolder={handleMoveToFolder}
      />
      <div ref={ref}>
        <Card
          size="small"
          style={cardStyle}
          styles={{
            body: {
              padding: "8px 5px",
            },
          }}
        >
          {folderContent}
        </Card>
      </div>

      <Modal
        title={
          <div>
            <span>
              <DeleteOutlined /> Delete Folder
            </span>
          </div>
        }
        open={deleteFolderModalVisible}
        onCancel={() => setDeleteFolderModalVisible(false)}
        footer={null}
        width={500}
      >
        <div>
          <p>
            You are about to delete the folder: &quot;<b>{folder.name}</b>&quot;
            that contains{" "}
            <b>
              {folder.chatIds.length} chat{folder.chatIds.length > 1 ? "s" : ""}
            </b>
            .
          </p>
          <br />
          <p>Deleting this folder will affect the chats inside it.</p>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
              marginTop: "24px",
            }}
          >
            <Button
              onClick={() => {
                deleteProjectFolder(folder.id, false);
                message.success("Folder deleted, chats moved to chats view");
                setDeleteFolderModalVisible(false);
              }}
            >
              Delete Folder, Keep Chats
            </Button>
            <Button
              danger
              type="primary"
              onClick={() => {
                deleteProjectFolder(folder.id, true);
                message.success("Folder and chats deleted successfully");
                setDeleteFolderModalVisible(false);
              }}
            >
              Delete Folder & Chats
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ProjectFolderBlock;
