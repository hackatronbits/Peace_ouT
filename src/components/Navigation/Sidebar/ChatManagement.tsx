import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Button, Modal, Dropdown, Input, Tooltip, Divider, App } from "antd";
import type { MenuProps } from "antd";
import {
  PlusCircleFilled,
  DeleteOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  ClockCircleOutlined,
  InboxOutlined,
  CommentOutlined,
  FolderAddFilled,
  CloseOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { useApp } from "../../../context/AppContext";
import ArchivedChats from "./ArchivedChats";
import "./ChatInfo.css";
import ProjectFolderBlock from "./ProjectFolder/ProjectFolderBlock";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DraggableChatItem from "./DraggableChatItem";
import { getMainListMenuItems } from "../../../utils/chatUtils";
import ChatInfoModal from "./ChatOpsModals/ChatInfoModal";
import { ChatInfo } from "../../../utils/chatUtils";
import MoveFolderModal from "./ChatOpsModals/MoveFolderModal";

interface ChatManagementProps {
  isCollapsed: boolean;
  onToggleSidebar: () => void;
}

type SortOption = "recent" | "oldest" | "az" | "za";

const ChatManagement: React.FC<ChatManagementProps> = ({
  isCollapsed,
  onToggleSidebar,
}) => {
  const {
    chats,
    activeChat,
    setActiveChat,
    startNewChat,
    deleteChat,
    isTemporaryMode,
    archiveChat,
    archivedChats,
    exportChat,
    togglePinChat,
    projectFolders,
    createProjectFolder,
    addChatToFolder,
  } = useApp();
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [selectedChatInfo, setSelectedChatInfo] = useState<ChatInfo | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("recent");
  const [showArchived, setShowArchived] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const { message } = App.useApp();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    setSortOption(e.key as SortOption);
  };

  // Get all chat IDs that are in folders
  const chatsInFolders = projectFolders.reduce((acc: string[], folder) => {
    return [...acc, ...folder.chatIds];
  }, []);

  // Filter and sort chats
  const filteredAndSortedChats = useMemo(() => {
    // Get all non-archived chats and filter out chats that are in folders
    let result = chats.filter(
      (chat) => !chat.isArchived && !chatsInFolders.includes(chat.id),
    );

    // Then filter by search query if it exists
    if (searchQuery.trim()) {
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
  }, [chats, searchQuery, sortOption, chatsInFolders]);

  // Get pinned and unpinned chats from filtered results
  const pinnedChats = useMemo(() => {
    // First get pinned chats
    const pinned = filteredAndSortedChats.filter((chat) => chat.isPinned);

    // Then apply the current sort option
    switch (sortOption) {
      case "recent":
      case "oldest":
        // For time-based sorting, still prioritize pin time but respect the direction
        return sortOption === "recent"
          ? pinned.sort((a, b) => (b.pinnedAt || 0) - (a.pinnedAt || 0))
          : pinned.sort((a, b) => (a.pinnedAt || 0) - (b.pinnedAt || 0));
      case "az":
        return pinned.sort((a, b) => a.title.localeCompare(b.title));
      case "za":
        return pinned.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return pinned;
    }
  }, [filteredAndSortedChats, sortOption]);

  const unpinnedChats = useMemo(() => {
    // Get unpinned chats
    const unpinned = filteredAndSortedChats.filter((chat) => !chat.isPinned);

    // Apply the current sort option
    switch (sortOption) {
      case "recent":
        return unpinned.sort((a, b) => {
          const aTime = new Date(b.updatedAt).getTime();
          const bTime = new Date(a.updatedAt).getTime();
          return aTime - bTime;
        });
      case "oldest":
        return unpinned.sort((a, b) => {
          const aTime = new Date(a.updatedAt).getTime();
          const bTime = new Date(b.updatedAt).getTime();
          return aTime - bTime;
        });
      case "az":
        return unpinned.sort((a, b) => a.title.localeCompare(b.title));
      case "za":
        return unpinned.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return unpinned;
    }
  }, [filteredAndSortedChats, sortOption]);

  const handleChatClick = useCallback(
    (chatId: string | null, type: string, folderId?: string) => {
      if (type === "new") {
        startNewChat(folderId);
        // On mobile, collapse sidebar
        if (window.innerWidth <= 768) {
          onToggleSidebar();
        }
      } else {
        const selectedChat = chats.find((chat) => chat.id === chatId);
        if (selectedChat) {
          setActiveChat(selectedChat);
          localStorage.setItem("PC_activeChat", JSON.stringify(selectedChat));
          localStorage.setItem("PC_selectedModel", String(selectedChat.model));
          // On mobile, collapse sidebar when chat is selected
          if (window.innerWidth <= 768) {
            onToggleSidebar();
          }
        }
      }
    },
    [chats, setActiveChat, startNewChat, onToggleSidebar],
  );

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

  const [moveFolderModalVisible, setMoveFolderModalVisible] = useState(false);
  const [selectedChatForMove, setSelectedChatForMove] = useState<string | null>(
    null,
  );

  const handleMoveToFolder = useCallback((chatId: string) => {
    setSelectedChatForMove(chatId);
    setMoveFolderModalVisible(true);
  }, []);

  const handleMoveChatToFolder = useCallback(
    (folderId: string) => {
      if (selectedChatForMove) {
        addChatToFolder(folderId, selectedChatForMove);
      }
    },
    [selectedChatForMove, addChatToFolder],
  );

  const chatMenuItems = useCallback(
    (chat: any) =>
      getMainListMenuItems({
        chat,
        exportChat,
        archiveChat,
        togglePinChat,
        onInfoClick: handleInfoClick,
        onRename: handleStartRename,
        onDeleteClick: handleStartDelete,
        onMoveToFolder: handleMoveToFolder,
        projectFolders,
      }),
    [
      exportChat,
      archiveChat,
      togglePinChat,
      handleInfoClick,
      projectFolders,
      handleMoveToFolder,
    ],
  );

  const renderChatItem = useCallback(
    (chat: any) => {
      const isActive = activeChat?.id === chat.id;
      const isHovered = hoveredChatId === chat.id;

      return (
        <DraggableChatItem
          key={chat.id}
          chat={chat}
          isActive={isActive}
          onSelect={() => handleChatClick(chat.id, "existing")}
          isHovered={isHovered}
          onMouseEnter={() => setHoveredChatId(chat.id)}
          onMouseLeave={() => setHoveredChatId(null)}
          menuItems={chatMenuItems(chat)}
          isEditing={isEditingTitle === chat.id}
          onIsEditingTitle={setIsEditingTitle}
        />
      );
    },
    [activeChat, hoveredChatId, chatMenuItems, isEditingTitle, editedTitle],
  );

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createProjectFolder(newFolderName.trim());
      setNewFolderName("");
      setIsCreatingFolder(false);
    }
  };

  const handleCancelCreateFolder = () => {
    setNewFolderName("");
    setIsCreatingFolder(false);
  };

  return (
    <div className={`chat-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <DndProvider backend={HTML5Backend}>
        {isTemporaryMode && (
          <div className="temp-mode-overlay">
            <div className="overlay-content">
              <ClockCircleOutlined className="overlay-icon" />
              <span>Exit Temporary Chat to access/create chats</span>
            </div>
          </div>
        )}
        <div className="chat-sidebar-header">
          <Button
            type="primary"
            className="new-chat-button"
            onClick={() => handleChatClick("NA", "new")}
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
                items: [
                  {
                    key: "recent",
                    label: "Recent First",
                    icon: <ClockCircleOutlined />,
                  },
                  {
                    key: "oldest",
                    label: "Oldest First",
                    icon: (
                      <ClockCircleOutlined
                        style={{ transform: "scaleX(-1)" }}
                      />
                    ),
                  },
                  {
                    key: "az",
                    label: "A - Z",
                    icon: <SortAscendingOutlined />,
                  },
                  {
                    key: "za",
                    label: "Z - A",
                    icon: (
                      <SortAscendingOutlined
                        style={{ transform: "rotate(180deg)" }}
                      />
                    ),
                  },
                ],
                onClick: handleMenuClick,
                selectedKeys: [sortOption],
              }}
              trigger={["click"]}
              placement={isMobile ? "bottomLeft" : "bottomRight"}
              getPopupContainer={(trigger) => trigger.parentElement!}
            >
              <Tooltip title="Sort Chats">
                <Button
                  type="text"
                  icon={<SortAscendingOutlined style={{ fontSize: "16px" }} />}
                  className="sort-button"
                />
              </Tooltip>
            </Dropdown>
            <Tooltip title="Archived Chats">
              <Button
                type="text"
                icon={<InboxOutlined style={{ fontSize: "16px" }} />}
                onClick={() => setShowArchived(!showArchived)}
                className="archive-button"
                style={{ padding: "0% 10%" }}
              >
                {archivedChats.length > 0 && (
                  <span className="archive-count">{archivedChats.length}</span>
                )}
              </Button>
            </Tooltip>
            <Tooltip title="Create Project Folders">
              <Button
                type="text"
                icon={<FolderAddFilled style={{ fontSize: "16px" }} />}
                onClick={() => setIsCreatingFolder(true)}
                className="archive-button"
              />
            </Tooltip>
          </div>
        </div>

        {showArchived ? (
          <ArchivedChats searchQuery={searchQuery} sortOption={sortOption} />
        ) : (
          <div className="chat-list">
            <Divider style={{ color: "#b6babe" }}>
              <CommentOutlined /> <small>ACTIVE</small>
            </Divider>
            {isCreatingFolder && (
              <div style={{ marginLeft: "6px", width: "96%" }}>
                <Input
                  autoFocus
                  placeholder="Name your project"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onPressEnter={handleCreateFolder}
                  style={{ backgroundColor: "unset !important" }}
                  prefix={<FolderAddFilled style={{ fontSize: "20px" }} />}
                  suffix={
                    <div
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
                      {newFolderName.trim() && (
                        <Tooltip title="Create">
                          <CheckOutlined
                            onClick={handleCreateFolder}
                            style={{ cursor: "pointer" }}
                          />
                        </Tooltip>
                      )}
                      <Tooltip title="Dismiss">
                        <CloseOutlined
                          onClick={handleCancelCreateFolder}
                          style={{ cursor: "pointer" }}
                        />
                      </Tooltip>
                    </div>
                  }
                />
              </div>
            )}

            {filteredAndSortedChats.length === 0 &&
            projectFolders.length === 0 ? (
              <div className="empty-chat-list">
                {searchQuery ? "No matching chats found" : "No chats yet"}
              </div>
            ) : (
              <>
                {/* Project Folders */}
                {projectFolders.map((folder) => (
                  <ProjectFolderBlock
                    key={folder.id}
                    folder={folder}
                    handleChatClick={handleChatClick}
                  />
                ))}

                {pinnedChats.length > 0 && (
                  <div className="pinned-section">
                    {pinnedChats.map(renderChatItem)}
                  </div>
                )}
                <div className="chats-section">
                  {unpinnedChats.map(renderChatItem)}
                </div>
              </>
            )}
          </div>
        )}

        {/* Move to Folder Modal */}
        <MoveFolderModal
          visible={moveFolderModalVisible}
          onClose={() => setMoveFolderModalVisible(false)}
          folders={projectFolders}
          onMoveToFolder={handleMoveChatToFolder}
        />

        {/* Delete Modal */}
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
            removed from local/cloud storage, and you will not be able to
            recover it. <br /> <br /> Are you sure you want to delete this chat?
          </p>
        </Modal>

        <ChatInfoModal
          visible={infoModalVisible}
          onClose={() => setInfoModalVisible(false)}
          chatInfo={selectedChatInfo}
        />
      </DndProvider>
    </div>
  );
};

export default ChatManagement;
