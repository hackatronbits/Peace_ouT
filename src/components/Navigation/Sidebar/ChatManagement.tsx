import React, { useState, useMemo } from "react";
import { Button, Modal, Dropdown, Input } from "antd";
import type { MenuProps } from "antd";
import {
  PlusCircleFilled,
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  SortAscendingOutlined,
} from "@ant-design/icons";
import { useApp } from "../../../context/AppContext";

interface ChatManagementProps {
  isCollapsed: boolean;
}

type SortOption = "recent" | "oldest" | "az" | "za";

const ChatManagement: React.FC<ChatManagementProps> = ({ isCollapsed }) => {
  const {
    chats,
    activeChat,
    setActiveChat,
    startNewChat,
    deleteChat,
    setChats,
  } = useApp();
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("recent");
  const [selectedChatInfo, setSelectedChatInfo] = useState<{
    id: string;
    title: string;
    model: string;
    messagesCount: number;
    size: number;
    createdAt: string;
  } | null>(null);

  // Sort menu items
  const menuItems: MenuProps["items"] = [
    {
      key: "sort",
      type: "group",
      label: "Sort By",
      children: [
        {
          key: "recent",
          label: "Recent First",
        },
        {
          key: "oldest",
          label: "Oldest First",
        },
        {
          key: "az",
          label: "A - Z",
        },
        {
          key: "za",
          label: "Z - A",
        },
      ],
    },
  ];

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    setSortOption(key as SortOption);
  };

  // Filter and sort chats
  const filteredAndSortedChats = useMemo(() => {
    let result = [...chats];

    // First filter by search query
    if (searchQuery) {
      result = result.filter((chat) =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Then sort based on selected option
    switch (sortOption) {
      case "recent":
        result.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
        break;
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
        );
        break;
      case "az":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "za":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    return result;
  }, [chats, searchQuery, sortOption]);

  const handleChatClick = (chatId: string) => {
    const selectedChat = chats.find((chat) => chat.id === chatId);
    if (selectedChat) {
      setActiveChat(selectedChat);
      localStorage.setItem("selectedModel", selectedChat.model);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    setChatToDelete(chatId);
    setDeleteModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setChatToDelete(null);
  };

  const handleDeleteConfirm = () => {
    if (chatToDelete) {
      deleteChat(chatToDelete);
      setDeleteModalVisible(false);
      setChatToDelete(null);
    }
  };

  const handleEditTitle = (
    e: React.MouseEvent,
    chatId: string,
    currentTitle: string,
  ) => {
    e.stopPropagation();
    setIsEditingTitle(chatId);
    setEditedTitle(currentTitle);
  };

  const handleTitleSave = (chatId: string) => {
    if (editedTitle.trim()) {
      const updatedChat = chats.find((chat) => chat.id === chatId);
      if (updatedChat) {
        updatedChat.title = editedTitle.trim();

        const updatedChats = chats.map((chat) =>
          chat.id === chatId ? updatedChat : chat,
        );

        localStorage.setItem("chats", JSON.stringify(updatedChats));

        if (activeChat?.id === chatId) {
          setActiveChat(updatedChat);
        }

        setChats(updatedChats);
      }
    }
    setIsEditingTitle(null);
    setEditedTitle("");
  };

  const handleInfoClick = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      const chatSize = new Blob([JSON.stringify(chat)]).size / 1024;
      const createdAtDate = chat.createdAt
        ? new Date(chat.createdAt)
        : new Date();
      const formattedDate = createdAtDate
        .toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
        .replace(",", "");

      setSelectedChatInfo({
        id: chatId,
        title: chat.title || chat.messages[0]?.content.slice(0, 30) + "...",
        model: formatModelName(chat.model || "Not specified"),
        messagesCount: chat.messages.length,
        size: Number(chatSize.toFixed(2)),
        createdAt: formattedDate,
      });
      setInfoModalVisible(true);
    }
  };

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

  return (
    <div className={`chat-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="chat-sidebar-header">
        <Button
          type="primary"
          className="new-chat-button"
          onClick={startNewChat}
          icon={<PlusCircleFilled style={{ strokeWidth: 50 }} />}
        >
          New Chat
        </Button>

        {/* Search and Sort Controls */}
        <div className="chat-controls">
          <Input
            placeholder="Search Chats..."
            prefix={<SearchOutlined style={{ strokeWidth: 50 }} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <Dropdown
            menu={{
              items: menuItems,
              onClick: handleMenuClick,
            }}
            trigger={["click"]}
            overlayClassName="sidebar-dropdown"
          >
            <Button
              icon={<SortAscendingOutlined style={{ strokeWidth: 50 }} />}
              className="sort-button"
            ></Button>
          </Dropdown>
        </div>
      </div>

      <div className="chat-list">
        {filteredAndSortedChats.length === 0 ? (
          <div className="empty-chat-list">
            {searchQuery ? "No matching chats found" : "No chats yet"}
          </div>
        ) : (
          filteredAndSortedChats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${chat.id === activeChat?.id ? "active" : ""}`}
              onClick={() => handleChatClick(chat.id)}
              onMouseEnter={() => setHoveredChatId(chat.id)}
              onMouseLeave={() => setHoveredChatId(null)}
            >
              <div className="chat-item-content">
                <div className="chat-header">
                  <div
                    className="chat-header-left"
                    style={{ paddingBottom: "4%" }}
                  >
                    {chat.model && (
                      <div className="chat-model-tag">
                        {formatModelName(chat.model)}
                      </div>
                    )}
                  </div>

                  <div className="chat-header-right">
                    {hoveredChatId === chat.id && !isEditingTitle && (
                      <>
                        <Button
                          type="text"
                          className="chat-action-button"
                          icon={<EditOutlined />}
                          onClick={(e) =>
                            handleEditTitle(e, chat.id, chat.title)
                          }
                        />
                        <Button
                          type="text"
                          className="chat-action-button"
                          icon={<DeleteOutlined />}
                          onClick={(e) => handleDeleteClick(e, chat.id)}
                        />
                        <Button
                          type="text"
                          className="chat-action-button"
                          icon={<InfoCircleOutlined />}
                          onClick={(e) => handleInfoClick(e, chat.id)}
                        />
                      </>
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
                    className="title-edit-input"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="chat-title">
                    {chat.title ||
                      chat.messages[0]?.content.slice(0, 30) + "..."}
                  </span>
                )}

                {chat.messages && chat.messages.length > 0 && (
                  <div className="chat-preview">
                    {chat.messages[chat.messages.length - 1].content.slice(
                      0,
                      60,
                    )}
                    {chat.messages[chat.messages.length - 1].content.length > 60
                      ? "..."
                      : ""}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Chat"
        open={deleteModalVisible}
        onCancel={handleDeleteCancel}
        closable={false}
        footer={[
          <Button key="cancel" onClick={handleDeleteCancel}>
            Cancel
          </Button>,
          <Button key="delete" danger onClick={handleDeleteConfirm}>
            Delete
          </Button>,
        ]}
      >
        <p>
          This action is permanent and cannot be undone. The chat will be
          removed from local/cloud storage, and you will not be able to recover
          it. <br /> <br /> Are you sure you want to delete this chat?
        </p>
      </Modal>

      {/* Chat Info Modal */}
      <Modal
        title="Chat Information"
        open={infoModalVisible}
        onCancel={() => setInfoModalVisible(false)}
        closable={false}
        footer={[
          <Button key="close" onClick={() => setInfoModalVisible(false)}>
            Close
          </Button>,
        ]}
      >
        {selectedChatInfo && (
          <div className="chat-info-content">
            <p>
              <strong>Created At</strong> {selectedChatInfo.createdAt}
            </p>
            <p>
              <strong>Title</strong> {selectedChatInfo.title}
            </p>
            <p>
              <strong>AI Model</strong> {selectedChatInfo.model}
            </p>
            <p>
              <strong>Messages</strong> {selectedChatInfo.messagesCount}
            </p>
            <p>
              <strong>Size</strong> {selectedChatInfo.size.toFixed(2)} KB
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ChatManagement;
