import React from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useApp } from "../../context/AppContext";
import "./LoadingScreen.css";

const LoadingScreen: React.FC = () => {
  const { isDarkMode } = useApp();
  const antIcon = <LoadingOutlined style={{ fontSize: 48 }} spin />;

  return (
    <div className={`loading-screen ${isDarkMode ? "dark" : "light"}`}>
      <div className="loading-content">
        {/* <div className="logo-container">
          <img 
            src="/logo.png" 
            alt="Logo"
            className="app-logo"
          />
        </div> */}
        <Spin indicator={antIcon} />
        <h1 className="loading-title">PromptCue</h1>
        <p className="loading-subtitle">Initializing your AI experience...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
