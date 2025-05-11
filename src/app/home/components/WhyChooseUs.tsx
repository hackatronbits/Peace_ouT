"use client";

import "../styles.css";
import {
  ThunderboltOutlined,
  RobotOutlined,
  ApiOutlined,
  SecurityScanOutlined,
  CloudServerOutlined,
  TeamOutlined,
} from "@ant-design/icons";

export default function Stats() {
  const stats = [
    {
      label: "Response Speed",
      value: "<2s",
      description: "Average AI response time",
      icon: <ThunderboltOutlined style={{ fontSize: "24px" }} />,
    },
    {
      label: "AI Models",
      value: "5+",
      description: "Supported language models",
      icon: <RobotOutlined style={{ fontSize: "24px" }} />,
    },
    {
      label: "API Integrations",
      value: "10+",
      description: "Ready-to-use connections",
      icon: <ApiOutlined style={{ fontSize: "24px" }} />,
    },
    {
      label: "Data Privacy",
      value: "100%",
      description: "End-to-end encryption",
      icon: <SecurityScanOutlined style={{ fontSize: "24px" }} />,
    },
    {
      label: "Cloud Ready",
      value: "24/7",
      description: "Enterprise availability",
      icon: <CloudServerOutlined style={{ fontSize: "24px" }} />,
    },
    {
      label: "Early Access",
      value: "Open",
      description: "Join the waitlist today",
      icon: <TeamOutlined style={{ fontSize: "24px" }} />,
    },
  ];

  return (
    <section className="models-section" id="stats">
      <div className="section-header">
        <h2>Why Choose Us</h2>
        <p>
          Connect with the world&apos;s most powerful AI models through our
          unified interface. Experience seamless conversations with
          industry-leading language models.
        </p>
      </div>
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="stat-card"
            style={{
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-info">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-description">{stat.description}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
