"use client";
import { useState, useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { ConfigProvider, theme } from "antd";
import AppManagement from "../../components/Navigation/Sidebar/AppManagement";
import ChatManagement from "../../components/Navigation/Sidebar/ChatManagement";
import ChatInterface from "../../components/Conversation/ChatInterface";
import TopNavbar from "../../components/Navigation/ChatInterface/TopNavbar";
import ModelSettings from "../../components/Navigation/Model/ModelSettings";
import { useApp } from "../../context/AppContext";
import { logInfo } from "../../utils/logger";
import PromptLibrary from "../../components/PromptLibrary/PromptLibrary";

const ConversationsLayout = () => {
  const pathname = usePathname();
  const { activeChat, startNewChat } = useApp();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState("chats");
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    // Remove active class when changing views
    const mainContent = document.querySelector(".main-content");
    if (mainContent) {
      mainContent.classList.remove("active");
      if (currentView === "models" || currentView === "promptLibrary") {
        mainContent.classList.add("no-margin");
      } else {
        mainContent.classList.remove("no-margin");
      }
    }
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

  useLayoutEffect(() => {
    if (!isFirstLoad || currentView !== "chats") return;

    const checkNavigation = () => {
      try {
        const navEntry = window.performance.getEntriesByType(
          "navigation",
        )[0] as PerformanceNavigationTiming;

        // If it's not a reload, force start new chat immediately
        if (navEntry.type !== "reload") {
          // First clear localStorage to prevent activeChat from being restored
          localStorage.removeItem("PC_activeChat");
          // Finally start new chat
          startNewChat();
        }
      } catch (e) {
        console.error("Navigation check failed:", e);
      }
      setIsFirstLoad(false);
    };
    checkNavigation();
  }, []);

  useEffect(() => {
    // Update document title when chat changes
    if (pathname === "/conversations") {
      if (currentView === "models") {
        document.title = "Model Settings | PromptCue";
      } else if (currentView === "aiAgent") {
        document.title = "AI Agents | PromptCue";
      } else if (currentView === "promptLibrary") {
        document.title = "Prompt Library | PromptCue";
      } else {
        document.title = activeChat?.title
          ? `${activeChat.title} - PromptCue`
          : "PromptCue";
      }
    }
    handleViewChange(currentView);
  }, [activeChat, pathname, currentView]);

  useEffect(() => {
    // Add active class to main-content when chat is selected
    const mainContent = document.querySelector(".main-content");
    if (mainContent && activeChat && currentView === "chats") {
      mainContent.classList.add("active");
    } else if (mainContent) {
      mainContent.classList.remove("active");
    }
  }, [activeChat, currentView]);

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
          <ChatManagement
            isCollapsed={isSidebarCollapsed}
            onToggleSidebar={handleToggleSidebar}
          />
        )}

        <div className={`main-content ${isSidebarCollapsed ? "expanded" : ""}`}>
          {currentView === "chats" && (
            <>
              <TopNavbar
                isSidebarCollapsed={isSidebarCollapsed}
                onToggleSidebar={handleToggleSidebar}
              />
              <ChatInterface onViewChange={handleViewChange} />
            </>
          )}
          {currentView === "models" && <ModelSettings />}
          {currentView === "promptLibrary" && (
            <PromptLibrary onViewChange={handleViewChange} />
          )}
        </div>
      </div>
    </ConfigProvider>
  );
};

export default ConversationsLayout;
