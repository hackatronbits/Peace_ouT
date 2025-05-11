"use client";

import React, { useState, useEffect } from "react";
import {
  BulbTwoTone,
  FileTextTwoTone,
  EditTwoTone,
  CodeTwoTone,
  CompassTwoTone,
  RocketTwoTone,
  RightOutlined,
  SafetyCertificateFilled,
} from "@ant-design/icons";
import styles from "./SuggestionBubbles.module.css";
import Image from "next/image";
import { useApp } from "../../../context/AppContext";
import { featureUsageLogger } from "../../../utils/featureUsageLogger";

interface SuggestionBubbleProps {
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  {
    icon: <BulbTwoTone twoToneColor="#eecd1e" />,
    text: "Create Ideas",
    prompt:
      "I need creative ideas for a digital marketing campaign. Target audience: young professionals (25-35). Goals: increase brand awareness and engagement on social media. Budget: moderate. Please provide 5 innovative campaign concepts with potential ROI estimates.",
  },
  {
    icon: <FileTextTwoTone twoToneColor="#36c121" />,
    text: "Summarize Text",
    prompt:
      "Please analyze the following text for: 1) Main themes and key messages 2) Tone and style 3) Target audience 4) Areas for improvement 5) SEO optimization opportunities. Provide your analysis in a structured format.",
  },
  {
    icon: <EditTwoTone twoToneColor="#7144e1" />,
    text: "Make a Plan",
    prompt:
      "Please help improve this paragraph for: 1) Clarity and flow 2) Professional tone 3) Engagement 4) Grammar and style 5) Impact. Provide the enhanced version along with explanations for major changes.",
  },
  {
    icon: <CodeTwoTone />,
    text: "Code",
    prompt:
      "Please review this code for: 1) Performance optimization 2) Best practices 3) Code readability 4) Potential bugs 5) Security concerns. Provide specific recommendations and code examples where applicable.",
  },
  {
    icon: <CompassTwoTone twoToneColor="#d89535" />,
    text: "Strategic Guide",
    prompt:
      "I need help developing a business strategy. Please consider: 1) Market analysis 2) Competitive advantages 3) Growth opportunities 4) Resource allocation 5) Risk assessment. Provide a structured framework with actionable recommendations.",
  },
  {
    icon: <RocketTwoTone twoToneColor="#eb2f96" />,
    text: "Innovation Help",
    prompt:
      "Help me improve customer experience through innovation. Focus areas: 1) Pain points in current journey 2) Technology opportunities 3) Industry best practices 4) Implementation feasibility 5) Success metrics. Provide detailed solutions with implementation steps.",
  },
];

const SuggestionBubbles: React.FC<SuggestionBubbleProps> = ({
  onSuggestionClick,
}) => {
  const { mode, agentType, isTemporaryMode } = useApp();
  const [isMobile, setIsMobile] = useState(false);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setShowAllSuggestions(true);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const visibleSuggestions =
    isMobile && !showAllSuggestions ? suggestions.slice(0, 2) : suggestions;

  const handleSuggestionClick = async (suggestion: string) => {
    try {
      await featureUsageLogger({
        featureName: "suggestions",
        eventType: "suggestion_clicked",
        eventMetadata: {
          suggestion,
          clickedAt: new Date().toISOString(),
        },
      });

      onSuggestionClick(suggestion);
    } catch (error) {
      console.error("Error logging suggestion click:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {mode === "agent" ? (
          <>
            {agentType === "research" ? (
              <Image
                priority={true}
                src="/research_agent_scott.png"
                alt="Agent Scott"
                width={120}
                height={120}
                className={styles.agentImage}
              />
            ) : (
              agentType === "tech" && (
                <Image
                  priority={true}
                  src="/tech_agent_jordan.png"
                  alt="Agent Jordan"
                  width={120}
                  height={120}
                  className={styles.agentImage}
                />
              )
            )}
            <h1 className={styles.titleAgent}>
              {agentType === "research"
                ? "Scott"
                : agentType === "tech" && "Jordan"}
            </h1>
            <p className={styles.taglineAgent}>
              {agentType === "research"
                ? "Scott performs research and delivers insights. It saves users time, simplifies complex topics, and provides actionable answers."
                : agentType === "tech" &&
                  "Jordan is your go-to companion for coding, troubleshooting, and smarter tech solutions."}
            </p>
          </>
        ) : isTemporaryMode === true ? (
          <>
            <h1 className={styles.title}>Temporary Chat</h1>

            <p className={styles.tagline}>
              <SafetyCertificateFilled /> Complete Privacy, Your Way.
            </p>

            <small style={{ color: "#9ca2aa" }}>
              Messages will not be saved after this session ends
            </small>
          </>
        ) : (
          <>
            <h1 className={styles.title}>PromptCue</h1>
            <p className={styles.tagline}>
              Prompt. Connect. Interact with Intelligence.
            </p>
          </>
        )}
      </div>
      {mode != "agent" && isTemporaryMode === false && (
        <div
          className={`${styles.bubblesContainer} ${showAllSuggestions ? styles.expanded : ""}`}
        >
          {visibleSuggestions.map((suggestion, index) => (
            <button
              key={index}
              className={styles.bubble}
              onClick={() => handleSuggestionClick(suggestion.prompt)}
            >
              {suggestion.icon}
              <span>{suggestion.text}</span>
            </button>
          ))}
          {isMobile && !showAllSuggestions && (
            <button
              className={`${styles.bubble} ${styles.moreBubble}`}
              onClick={() => setShowAllSuggestions(true)}
            >
              <span>More</span>
              <RightOutlined />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SuggestionBubbles;
