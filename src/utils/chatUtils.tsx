import { MenuProps } from "antd";
import {
  InfoCircleOutlined,
  ExportOutlined,
  DeleteOutlined,
  PushpinOutlined,
  InboxOutlined,
  EditOutlined,
  RollbackOutlined,
  FolderAddOutlined,
} from "@ant-design/icons";
import { Chat, ProjectFolder } from "../context/AppContext";

export interface ChatInfo {
  id: string;
  title: string;
  model: string;
  messagesCount: number;
  size: number;
  createdAt: string;
  agentType: string;
}

interface ChatActionsProps {
  chat: Chat;
  exportChat: (chatId: string) => void;
  deleteChat?: (chatId: string) => void;
  archiveChat?: (chatId: string) => void;
  removeChatFromFolder?: (folderId: string, chatId: string) => void;
  folderId?: string;
  onInfoClick: (chatInfo: ChatInfo) => void;
  onRename?: (chatId: string) => void;
  onDeleteClick?: (chatId: string) => void;
  onMoveToFolder?: (chatId: string) => void;
  projectFolders?: ProjectFolder[];
  togglePinChat?: (chatId: string) => void;
}

export const formatModelName = (name: string): string => {
  return name
    .split("-")
    .map((part) => {
      if (part.toLowerCase() === "gpt") return "GPT";
      if (!isNaN(Number(part))) return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
};

export const getChatInfo = (chat: Chat): ChatInfo => {
  return {
    id: chat.id,
    title: chat.title,
    model: formatModelName(chat.model || "Not specified"),
    messagesCount: chat.messages.length,
    size: new Blob([JSON.stringify(chat)]).size / 1024,
    createdAt: chat.createdAt
      ? new Date(chat.createdAt).toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      : new Date().toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
    agentType: chat.messages[0]?.agentType || "na",
  };
};

export const handleChatExport = (
  chat: Chat,
  exportChat: (chatId: string) => void,
) => {
  exportChat(chat.id);
};

export const handleChatDelete = (
  chat: Chat,
  onDeleteClick: (chatId: string) => void,
) => {
  onDeleteClick(chat.id);
};

export const handleChatArchive = (
  chat: Chat,
  archiveChat: (chatId: string) => void,
) => {
  archiveChat(chat.id);
};

export const handleChatPin = (
  chat: Chat,
  togglePinChat: (chatId: string) => void,
) => {
  togglePinChat(chat.id);
};

export const handleRemoveFromFolder = (
  chat: Chat,
  folderId: string,
  removeChatFromFolder: (folderId: string, chatId: string) => void,
) => {
  removeChatFromFolder(folderId, chat.id);
};

export const getMainListMenuItems = ({
  chat,
  exportChat,
  archiveChat,
  togglePinChat,
  onInfoClick,
  onRename,
  onDeleteClick,
  onMoveToFolder,
  projectFolders,
}: ChatActionsProps): MenuProps["items"] => {
  const hasProjectFolders = projectFolders && projectFolders.length > 0;
  const menuItems: MenuProps["items"] = [
    {
      key: "info",
      icon: <InfoCircleOutlined />,
      label: "Info",
      onClick: () => onInfoClick(getChatInfo(chat)),
    },
    {
      key: "rename",
      icon: <EditOutlined />,
      label: "Rename",
      onClick: () => onRename && onRename(chat.id),
    },
    {
      key: "pin",
      icon: <PushpinOutlined />,
      label: chat.isPinned ? "Unpin" : "Pin",
      onClick: () => togglePinChat && handleChatPin(chat, togglePinChat),
    },
    {
      key: "archive",
      icon: <InboxOutlined />,
      label: "Archive",
      onClick: () => archiveChat && handleChatArchive(chat, archiveChat),
    },
    {
      key: "export",
      icon: <ExportOutlined />,
      label: "Export",
      onClick: () => handleChatExport(chat, exportChat),
    },
  ];

  if (hasProjectFolders) {
    menuItems.push({
      key: "moveToFolder",
      icon: <FolderAddOutlined />,
      label: "Move to Folder",
      onClick: () => onMoveToFolder && onMoveToFolder(chat.id),
    });
  }

  menuItems.push({
    key: "delete",
    icon: <DeleteOutlined />,
    label: "Delete",
    onClick: () => onDeleteClick && handleChatDelete(chat, onDeleteClick),
    danger: true,
  });

  return menuItems;
};

export const getFolderMenuItems = ({
  chat,
  exportChat,
  folderId,
  removeChatFromFolder,
  onInfoClick,
  onRename,
  onDeleteClick,
  togglePinChat,
  projectFolders,
  onMoveToFolder,
}: ChatActionsProps): MenuProps["items"] => {
  const hasProjectFolders = projectFolders && projectFolders.length > 0;
  const menuItems: MenuProps["items"] = [
    {
      key: "info",
      icon: <InfoCircleOutlined />,
      label: "Info",
      onClick: () => onInfoClick(getChatInfo(chat)),
    },
    {
      key: "rename",
      icon: <EditOutlined />,
      label: "Rename",
      onClick: () => onRename && onRename(chat.id),
    },
    {
      key: "pin",
      icon: <PushpinOutlined />,
      label: chat.isPinned ? "Unpin" : "Pin",
      onClick: () => togglePinChat && togglePinChat(chat.id),
    },
    {
      key: "export",
      icon: <ExportOutlined />,
      label: "Export",
      onClick: () => handleChatExport(chat, exportChat),
    },
    {
      key: "remove",
      icon: <RollbackOutlined />,
      label: "Remove from Folder",
      onClick: () =>
        folderId &&
        removeChatFromFolder &&
        handleRemoveFromFolder(chat, folderId, removeChatFromFolder),
    },
  ];

  if (hasProjectFolders) {
    menuItems.push({
      key: "moveToFolder",
      icon: <FolderAddOutlined />,
      label: "Move to Folder",
      onClick: () => {
        onMoveToFolder && onMoveToFolder(chat.id);
      },
    });
  }

  menuItems.push({
    key: "delete",
    icon: <DeleteOutlined />,
    label: "Delete",
    onClick: () => onDeleteClick && handleChatDelete(chat, onDeleteClick),
    danger: true,
  });

  return menuItems;
};
