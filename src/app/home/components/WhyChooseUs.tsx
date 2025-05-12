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
      label: "Supported Languages",
      value: "20+",
      description: "Languages our AI understands",
      icon: <RobotOutlined style={{ fontSize: "24px" }} />,
    },
    {
      label: "API Integrations",
      value: "15+",
      description: "Ready-to-use API connections",
      icon: <ApiOutlined style={{ fontSize: "24px" }} />,
    },
    {
      label: "Data Privacy",
      value: "100%",
      description: "End-to-end encryption",
      icon: <SecurityScanOutlined style={{ fontSize: "24px" }} />,
    },
    {
      label: "Cloud Uptime",
      value: "99.99%",
      description: "Enterprise-grade reliability",
      icon: <CloudServerOutlined style={{ fontSize: "24px" }} />,
    },
    {
      label: "Active Users",
      value: "50K+",
      description: "Worldwide active users",
      icon: <TeamOutlined style={{ fontSize: "24px", color: '#4caf50' }} />,
    },
    {
      label: "Early Access",
      value: "Open",
      description: "Join the waitlist today",
      icon: <TeamOutlined style={{ fontSize: "24px" }} />,
    },
    {
      label: "Security Audits",
      value: "Quarterly",
      description: "Regular third-party reviews",
      icon: <SecurityScanOutlined style={{ fontSize: "24px", color: '#2196f3' }} />,
    },
    {
      label: "AI Models",
      value: "7+",
      description: "Supported language models",
      icon: <RobotOutlined style={{ fontSize: "24px", color: '#ff9800' }} />,
    },
    {
      label: "Custom Workflows",
      value: "Unlimited",
      description: "Automate your processes",
      icon: <ThunderboltOutlined style={{ fontSize: "24px", color: '#9c27b0' }} />,
    },
    {
      label: "Support",
      value: "24/7",
      description: "Live chat and email support",
      icon: <TeamOutlined style={{ fontSize: "24px", color: '#e91e63' }} />,
    },
    {
      label: "Integrations",
      value: "Slack, Zapier, more",
      description: "Connect with your favorite tools",
      icon: <ApiOutlined style={{ fontSize: "24px", color: '#00bcd4' }} />,
    },
    {
      label: "Data Centers",
      value: "5 Regions",
      description: "Global infrastructure",
      icon: <CloudServerOutlined style={{ fontSize: "24px", color: '#607d8b' }} />,
    },
    {
      label: "User Satisfaction",
      value: "98%",
      description: "Customer approval rating",
      icon: <TeamOutlined style={{ fontSize: "24px", color: '#8bc34a' }} />,
    },
  ];

  return (
    <section className="models-section" id="stats">
      <div className="section-header animated-header">
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
