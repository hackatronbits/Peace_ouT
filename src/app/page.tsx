"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ConfigProvider, theme } from "antd";
import AppManagement from "../components/Navigation/Sidebar/AppManagement";
import ChatManagement from "../components/Navigation/Sidebar/ChatManagement";
import ChatInterface from "../components/Conversation/ChatInterface";
import TopNavbar from "../components/Navigation/ChatInterface/TopNavbar";
import ModelSettings from "../components/Navigation/Model/ModelSettings";
import { useApp } from "../context/AppContext";
import { logInfo } from "../utils/logger";

export default function Home() {
  const pathname = usePathname();
  const { activeChat } = useApp();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState("chats");

  const handleViewChange = (view: string) => {
    setCurrentView(view);
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    logInfo("navigation", "page_loaded", {
      component: "HomePage",
      metadata: {
        path: window.location.pathname,
        chatId: activeChat?.id,
        timestamp: new Date().toISOString(),
      },
    });
  }, [activeChat?.id]);

  useEffect(() => {
    // Update document title when chat changes
    if (pathname === "/") {
      if (currentView === "models") {
        document.title = "Model Settings | PromptCue";
      } else {
        document.title = activeChat?.title
          ? `${activeChat.title} - PromptCue`
          : "PromptCue";
      }
    }
  }, [activeChat, pathname, currentView]);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#2563eb",
        },
      }}
    >
      <div className="app-layout">
        <AppManagement
          isCollapsed={isSidebarCollapsed}
          onViewChange={handleViewChange}
        />

        {currentView === "chats" && (
          <ChatManagement isCollapsed={isSidebarCollapsed} />
        )}

        <div className={`main-content ${isSidebarCollapsed ? "expanded" : ""}`}>
          {currentView === "chats" && (
            <>
              <TopNavbar
                isSidebarCollapsed={isSidebarCollapsed}
                onToggleSidebar={handleToggleSidebar}
              />
              <ChatInterface />
            </>
          )}
          {currentView === "models" && <ModelSettings />}
        </div>
      </div>
    </ConfigProvider>
  );
}
