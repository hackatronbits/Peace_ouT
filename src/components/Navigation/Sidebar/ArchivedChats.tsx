import React, { useMemo, useCallback } from "react";
import { Button, Tooltip, Empty, List, Divider, Dropdown, App } from "antd";
import {
  UndoOutlined,
  DeleteOutlined,
  InboxOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { useApp } from "../../../context/AppContext";
import type { MenuProps } from "antd";
import "./ArchivedChats.css";

interface ArchivedChatsProps {
  searchQuery: string;
  sortOption: string;
}

const ArchivedChats: React.FC<ArchivedChatsProps> = ({
  searchQuery,
  sortOption,
}) => {
  const { chats, deleteChat, restoreChat, setActiveChat, activeChat } =
    useApp();
  const { message } = App.useApp();

  const archivedChats = chats.filter((chat) => chat.isArchived);

  // Filter and sort archived chats
  const filteredAndSortedArchivedChats = useMemo(() => {
    // Get all archived chats
    let result = archivedChats;

    // Filter by search query if it exists
    if (searchQuery.trim()) {
      result = result.filter((chat) =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Sort based on selected option
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
  }, [archivedChats, searchQuery, sortOption]);

  const handleRestoreChat = (chatId: string) => {
    // Restore the chat
    restoreChat(chatId);

    // If we have an active chat, keep it active
    if (!activeChat) {
      const restoredChat = archivedChats.find((chat) => chat.id === chatId);
      if (restoredChat) {
        setActiveChat(restoredChat);
      }
    }

    message.success("Chat restored from archive");
  };

  const getChatMenuItems = useCallback(
    (chatId: string) => {
      const items: MenuProps["items"] = [
        {
          key: "restore",
          icon: <UndoOutlined />,
          label: "Restore Chat",
          onClick: () => handleRestoreChat(chatId),
        },

        {
          type: "divider",
        },
        {
          key: "delete",
          icon: <DeleteOutlined />,
          label: "Delete Chat",
          danger: true,
          onClick: () => {
            deleteChat(chatId);
          },
        },
      ];
      return items;
    },
    [archivedChats, activeChat, setActiveChat],
  );

  return (
    <div className="archived-chats">
      <Divider style={{ color: "#b6babe", padding: "8px" }}>
        <InboxOutlined /> <small>ARCHIVED</small>
      </Divider>
      {filteredAndSortedArchivedChats.length === 0 ? (
        <div className="ant-empty">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span className="ant-empty-description">
                {searchQuery
                  ? "No matching archived chats"
                  : "No archived chats"}
              </span>
            }
          />
        </div>
      ) : (
        <List
          className="archived-chats-list"
          itemLayout="horizontal"
          dataSource={filteredAndSortedArchivedChats}
          renderItem={(chat) => (
            <List.Item
              key={chat.id}
              actions={[
                <Tooltip title="Options" key="menu">
                  <Dropdown
                    menu={{ items: getChatMenuItems(chat.id) }}
                    trigger={["click"]}
                    placement="bottomRight"
                  >
                    <Button
                      type="text"
                      icon={<MoreOutlined />}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Dropdown>
                </Tooltip>,
              ]}
            >
              <List.Item.Meta
                title={chat.title}
                style={{ fontSize: "12px" }}
                description={
                  <span>
                    Archived {new Date(chat.updatedAt).toLocaleDateString()}
                  </span>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default ArchivedChats;
