import React, { useState } from "react";
import { Menu, Popover, Switch, Tooltip } from "antd";
import {
  SettingOutlined,
  UserOutlined,
  CommentOutlined,
  SunOutlined,
  MoonOutlined,
  InfoCircleOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import { useApp } from "../../../context/AppContext";

interface AppManagementProps {
  isCollapsed: boolean;
  onViewChange: (view: string) => void;
}

const AppManagement: React.FC<AppManagementProps> = ({
  isCollapsed,
  onViewChange,
}) => {
  const { isDarkMode, toggleDarkMode } = useApp();
  const [selectedKey, setSelectedKey] = useState("chats");
  const [isContactInfoOpen, setContactInfoOpen] = useState(false);
  const [isLocalStorageModalOpen, setIsLocalStorageModalOpen] = useState(false);

  const handleMenuClick = (key: string) => {
    if (key !== "profile") {
      setSelectedKey(key);
      onViewChange(key);
    }
  };

  const handleContactInfoClose = () => {
    setContactInfoOpen(false);
  };

  const profileContent = (
    <div className="profile-popup">
      <div className="profile-header">
        <UserOutlined className="profile-icon" />
        <span className="profile-name">Guest</span>
        <div
          className="storage-tag"
          onClick={() => setIsLocalStorageModalOpen(true)}
        >
          <DatabaseOutlined />
          <span>Browser Storage</span>
        </div>
      </div>
      <div className="profile-settings">
        <div className="theme-toggle">
          <span>
            {isDarkMode ? (
              <MoonOutlined style={{ marginRight: "8px" }} />
            ) : (
              <SunOutlined style={{ marginRight: "8px" }} />
            )}
            {isDarkMode ? "Dark Mode" : "Light Mode"}
          </span>
          <Switch
            checked={isDarkMode}
            onChange={toggleDarkMode}
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
            size="small"
          />
        </div>
        <br />
        <span
          onClick={() => setContactInfoOpen(true)}
          style={{ cursor: "pointer" }}
        >
          <InfoCircleOutlined /> Contact & Information
        </span>
      </div>
      <div className="profile-footer">PromptCue.com 2025</div>

    </div>
  );

  const menuItems = [
    {
      key: "chats",
      icon: (
        <Tooltip
          style={{ backgroundColor: "#1a1a1a" }}
          placement="right"
          title="Chats"
        >
          <CommentOutlined />
        </Tooltip>
      ),
    },
    {
      key: "models",
      icon: (
        <Tooltip
          style={{ backgroundColor: "#1a1a1a" }}
          placement="right"
          title="Model Settings"
        >
          <SettingOutlined />
        </Tooltip>
      ),
    },
  ];

  return (
    <nav className={`navigation-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <Menu
        className="nav-menu"
        selectedKeys={[selectedKey]}
        mode="inline"
        theme="dark"
        inlineCollapsed={isCollapsed}
        items={menuItems}
        onClick={({ key }) => handleMenuClick(key)}
      />

      <div className="nav-footer">
        <Popover
          content={profileContent}
          trigger="click"
          placement="rightTop"
          overlayClassName="profile-popover"
        >
          <div className="profile-button">
            <UserOutlined style={{ fontSize: "20px" }} />
          </div>
        </Popover>
        
      </div>
    </nav>
  );
};

export default AppManagement;
