import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import "./AiAgentSelectModal.css";
import { useApp } from "../../../../context/AppContext";
import { RobotOutlined } from "@ant-design/icons";
import { featureUsageLogger } from "../../../../utils/featureUsageLogger";
import Image from "next/image";

interface AiAgentSelectedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AiAgentSelectedModal: React.FC<AiAgentSelectedModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { setMode, setAgentType, startNewChat } = useApp();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleAgentSelect = async (agentType: string) => {
    try {
      featureUsageLogger({
        featureName: "ai_agent",
        eventType: "agent_selected",
        eventMetadata: {
          agentType,
          selectedAt: new Date().toISOString(),
        },
      });

      startNewChat();
      setMode("agent");
      setAgentType(agentType);
      onClose();
    } catch (error) {
      await featureUsageLogger({
        featureName: "ai_agent",
        eventType: "agent_select_failed",
        eventMetadata: {
          agentType,
          error,
          selectedAt: new Date().toISOString(),
        },
      });
    }
  };

  return (
    <Modal
      title={
        <>
          <RobotOutlined /> Choose Your AI Agent
        </>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={isMobile ? "100%" : 800}
      className="variables-modal"
      style={{
        top: isMobile ? 0 : 100,
        margin: isMobile ? 0 : "auto",
        maxWidth: "100vw",
        padding: isMobile ? "0" : "32px",
      }}
      styles={{
        body: {
          maxHeight: isMobile ? "calc(100vh - 110px)" : "none",
          overflowY: "auto",
          padding: 0,
        },
      }}
    >
      <div className="agent-notes">
        Empower your work with AI Agents designed to simplify, accelerate, and
        enhance your productivity. Whether you&apos;re tackling technical
        challenges or diving into research, our AI Agents are here to deliver
        clarity, solutions, and results—faster and smarter.
      </div>

      <div className="agents-container">
        <div className="agent-card" onClick={() => handleAgentSelect("tech")}>
          <Image
            src="/tech_agent_jordan.png"
            alt="Jordan - Tech AI Agent"
            className="agent-avatar"
            width={180}
            height={180}
          />
          <span className="agent-specialty">Tech Specialist</span>
          <div className="card-content">
            <h3 className="agent-name">Jordan</h3>
            <p className="agent-description">
              Your go-to technical assistant, Jordan helps with coding,
              debugging, system design, and troubleshooting.
            </p>
          </div>
        </div>

        <div
          className="agent-card"
          onClick={() => handleAgentSelect("research")}
        >
          <Image
            src="/research_agent_scott.png"
            alt="Scott - Research AI Agent"
            className="agent-avatar"
            width={180}
            height={180}
          />
          <span className="agent-specialty">Research Expert</span>
          <div className="card-content">
            <h3 className="agent-name">Scott</h3>
            <p className="agent-description">
              Your dedicated research assistant, Scott answers, summarizes, and
              explores in depth.
            </p>
          </div>
        </div>
      </div>

      <div className="disclaimer-note">
        Note: AI agents may occasionally make mistakes or provide incomplete
        information. Always verify critical information and use your judgment.
      </div>
    </Modal>
  );
};

export default AiAgentSelectedModal;
