import React, { useState, useEffect } from "react";
import { Menu, Popover, Tooltip } from "antd";
import {
  UserOutlined,
  CommentOutlined,
  SunOutlined,
  MoonOutlined,
  InfoCircleOutlined,
  DatabaseOutlined,
  RobotOutlined,
  SlidersOutlined,
  DesktopOutlined,
  CopyrightCircleOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { useApp } from "../../../context/AppContext";
import ContactInfo from "../../ContactInfo/ContactInfo";
import LocalStorageInfoModal from "../Storage/LocalStorageInfoModal";
import "../Storage/LocalStorageInfoModal.css";
import AiAgentSelectedModal from "../ChatInterface/Agent/AiAgentSelectModal";
import Link from "next/link";

interface AppManagementProps {
  isCollapsed: boolean;
  onViewChange: (view: string) => void;
}

const AppManagement: React.FC<AppManagementProps> = ({
  isCollapsed,
  onViewChange,
}) => {
  const { isDarkMode, toggleDarkMode, isTemporaryMode } = useApp();
  const [selectedKey, setSelectedKey] = useState("chats");
  const [isContactInfoOpen, setContactInfoOpen] = useState(false);
  const [isLocalStorageModalOpen, setIsLocalStorageModalOpen] = useState(false);
  const [isAiAgentModalOpen, setIsAiAgentModalOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light" | "auto">("auto");

  const handleThemeChange = (mode: "dark" | "light" | "auto") => {
    if (mode === "dark") {
      setTheme("dark");
      if (!isDarkMode) toggleDarkMode();
    } else if (mode === "light") {
      setTheme("light");
      if (isDarkMode) toggleDarkMode();
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      setTheme("auto");

      if (
        (prefersDark === "dark" && !isDarkMode) ||
        (prefersDark === "light" && isDarkMode)
      ) {
        toggleDarkMode();
      }
    }
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMenuClick = (key: string) => {
    if (key === "aiAgent") {
      setIsAiAgentModalOpen(true);
    } else {
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
          <span>Local Vault</span>
        </div>
      </div>
      <div className="profile-settings">
        <div className="toggle-settings-new">
          <div className="border border-gray-700 rounded-lg flex flex-row [&>*]:py-2 [&>*]:text-center max-w-xs bg-[#0f172a]">
            <div
              className={`basis-1/3  rounded-lg hover:bg-gray-800 cursor-pointer ${
                theme === "dark" ? "bg-gray-700" : ""
              }`}
              onClick={() => handleThemeChange("dark")}
            >
              <MoonOutlined />
            </div>
            <div
              className={`basis-1/3 rounded-lg hover:bg-gray-800 cursor-pointer ${
                theme === "light" ? "bg-gray-700" : ""
              }`}
              onClick={() => handleThemeChange("light")}
            >
              <SunOutlined />
            </div>
            <div
              className={`basis-1/3 rounded-lg hover:bg-gray-800 cursor-pointer ${
                theme === "auto" ? "bg-gray-700" : ""
              }`}
              onClick={() => handleThemeChange("auto")}
            >
              <DesktopOutlined />
            </div>
          </div>
        </div>
        <br />
        <span
          onClick={() => setContactInfoOpen(true)}
          style={{ cursor: "pointer" }}
        >
          <InfoCircleOutlined /> Contact & Information
        </span>
      </div>
      <div className="profile-footer">
        PromptCue <CopyrightCircleOutlined /> {new Date().getFullYear()}
        <br />
        <Link href="/company/contact" target="__blank">
          Contact Us
        </Link>{" "}
        |{" "}
        <Link href="https://discord.com/" target="__blank">
          Discord
        </Link>{" "}
        |{" "}
        <Link href="/legal/tnc" target="__blank">
          Terms
        </Link>{" "}
        |{" "}
        <Link href="/legal/privacy" target="__blank">
          Privacy
        </Link>
      </div>
      <ContactInfo
        isOpen={isContactInfoOpen}
        onClose={handleContactInfoClose}
      />
    </div>
  );

  const menuItems = [
    {
      key: "chats",
      icon: (
        <Tooltip
          style={{ backgroundColor: "#1a1a1a" }}
          placement="right"
          title={window.innerWidth > 768 && "Chats"}
        >
          <CommentOutlined />
        </Tooltip>
      ),
    },
    {
      key: "promptLibrary",
      icon: (
        <Tooltip
          style={{ backgroundColor: "#1a1a1a" }}
          placement="right"
          title={window.innerWidth > 768 && "Prompt Library"}
        >
          <BookOutlined />
        </Tooltip>
      ),
    },
    {
      key: "aiAgent",
      icon: (
        <Tooltip
          style={{ backgroundColor: "#1a1a1a" }}
          placement="right"
          title={window.innerWidth > 768 && "AI Agents"}
        >
          <RobotOutlined />
        </Tooltip>
      ),
      onClick: () => setIsAiAgentModalOpen(true),
      disabled: isTemporaryMode ? true : false,
    },
    {
      key: "models",
      icon: (
        <Tooltip
          style={{ backgroundColor: "#1a1a1a" }}
          placement="right"
          title={window.innerWidth > 768 && "Model Settings"}
        >
          <SlidersOutlined />
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
        <Tooltip
          style={{ backgroundColor: "#1a1a1a" }}
          placement="right"
          title={window.innerWidth > 768 && "Profile"}
        >
          <Popover
            content={profileContent}
            trigger="click"
            placement={isMobile ? "bottomLeft" : "rightTop"}
            classNames={{
              root: `profile-popover ${isMobile ? "mobile-profile-popover" : ""}`,
            }}
            align={
              isMobile
                ? {
                    offset: [0, -50], 
                  }
                : undefined
            }
          >
            <div className="profile-button">
              <UserOutlined style={{ fontSize: "20px" }} />
            </div>
          </Popover>
        </Tooltip>
        <LocalStorageInfoModal
          isOpen={isLocalStorageModalOpen}
          onClose={() => setIsLocalStorageModalOpen(false)}
        />
        <AiAgentSelectedModal
          isOpen={isAiAgentModalOpen}
          onClose={() => setIsAiAgentModalOpen(false)}
        />
      </div>
    </nav>
  );
};

export default AppManagement;
