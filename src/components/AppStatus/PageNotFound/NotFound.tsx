import React, { useEffect } from "react";
import { Button } from "antd";
import Head from "next/head";
import { HomeOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useApp } from "../../../context/AppContext";
import { logError } from "../../../utils/logger";
import "./NotFound.css";

const NotFound: React.FC = () => {
  const { isDarkMode } = useApp();

  useEffect(() => {
    logError("navigation", "page_not_found", new Error("404 Page Not Found"), {
      component: "NotFound",
      metadata: {
        path: window.location.pathname,
        timestamp: new Date().toISOString(),
      },
    });
    // Update the page title when component mounts
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      document.title = `404 - Page Not Found | ${currentPath} - PromptCue`;
    }
    // Cleanup - reset title when component unmounts
    return () => {
      if (typeof window !== "undefined") {
        document.title = "PromptCue";
      }
    };
  }, []);

  const handleGoHome = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  const handleGoBack = () => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  return (
    <>
      <Head>
        <title>404 - Page Not Found | PromptCue</title>
        <meta
          name="description"
          content="The page you're looking for doesn't exist. Return to PromptCue home page."
        />
      </Head>
      <div className={`not-found-container ${isDarkMode ? "dark" : "light"}`}>
        <div className="not-found-content">
          <div className="error-code">404</div>
          <div className="glitch-wrapper">
            <div className="glitch" data-text="Page Not Found">
              Page Not Found
            </div>
          </div>
          <p className="error-message">
            Oops! The page you&apos;re looking for seems to have wandered off
            into the digital void.
          </p>
          <div className="action-buttons">
            <Button
              type="primary"
              icon={<HomeOutlined />}
              onClick={handleGoHome}
              className="home-button"
            >
              Go Home
            </Button>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleGoBack}
              className="back-button"
            >
              Go Back
            </Button>
          </div>
          <div className="background-decoration">
            <div className="circle circle-1"></div>
            <div className="circle circle-2"></div>
            <div className="circle circle-3"></div>
            <div className="square square-1"></div>
            <div className="square square-2"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
