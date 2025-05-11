"use client";

import React from "react";
import { Typography, Timeline, Card, Tag, Button } from "antd";
import {
  RocketOutlined,
  BugOutlined,
  ToolOutlined,
  StarOutlined,
  ThunderboltOutlined,
  MailOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import "../info-pages.css";
import Header from "../../../components/Navigation/Header/Header";
import Footer from "../../../components/Navigation/Footer/Footer";

const { Paragraph, Text } = Typography;

const updates = [
  {
    date: "January 18, 2025",
    title: "Platform Enhancements",
    type: "major",
    icon: <RocketOutlined className="text-blue-500" />,
    description:
      "Major improvements to our AI platform including enhanced Speech-to-Text capabilities and new AI models.",
    changes: [
      "Improved Speech-to-Text accuracy by 25%",
      "Added support for 10 new languages",
      "Enhanced AI model response time",
      "New API endpoints for advanced features",
    ],
  },
  {
    date: "January 10, 2025",
    title: "Security Updates",
    type: "security",
    icon: <ToolOutlined className="text-green-500" />,
    description:
      "Critical security enhancements and performance optimizations.",
    changes: [
      "Enhanced API key security measures",
      "Improved data encryption protocols",
      "Added two-factor authentication",
      "Updated security documentation",
    ],
  },
  {
    date: "January 5, 2025",
    title: "Bug Fixes",
    type: "fix",
    icon: <BugOutlined className="text-orange-500" />,
    description: "Various bug fixes and stability improvements.",
    changes: [
      "Fixed API response handling",
      "Resolved UI rendering issues",
      "Improved error messaging",
      "Enhanced platform stability",
    ],
  },
  {
    date: "January 1, 2025",
    title: "New Features",
    type: "feature",
    icon: <StarOutlined className="text-purple-500" />,
    description: "Exciting new features and platform capabilities.",
    changes: [
      "New AI model integration options",
      "Advanced analytics dashboard",
      "Custom model fine-tuning",
      "Improved developer tools",
    ],
  },
];

const WhatsNewPageLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <div className="info-page-container">
          <div className="info-content">
            <div className="page-header">
              <div className="page-icon">
                <ThunderboltOutlined />
              </div>
              <div>
                <h1 className="page-title">What&apos;s New</h1>
                <p className="page-subtitle">
                  Latest updates and improvements to our platform
                </p>
              </div>
            </div>

            <div className="info-card">
              <Paragraph className="text-lg">
                Stay up to date with the latest features, improvements, and
                fixes we&apos;ve made to PromptCue. We&apos;re constantly
                working to make our AI platform better for you.
              </Paragraph>
            </div>

            <div className="space-y-6">
              {updates.map((update, index) => (
                <div key={index} className="info-card">
                  <div className="card-header">
                    <div className="card-icon">{update.icon}</div>
                    <div>
                      <h2 className="card-title">{update.title}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Text type="secondary">{update.date}</Text>
                        <Tag
                          color={
                            update.type === "major"
                              ? "blue"
                              : update.type === "security"
                                ? "green"
                                : update.type === "fix"
                                  ? "orange"
                                  : "purple"
                          }
                        >
                          {update.type.toUpperCase()}
                        </Tag>
                      </div>
                    </div>
                  </div>

                  <Paragraph className="mt-4">{update.description}</Paragraph>

                  <ul className="info-list mt-4">
                    {update.changes.map((change, idx) => (
                      <li key={idx}>{change}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="contact-section">
              <h3 className="text-2xl font-bold mb-6">
                Have a Feature Request?
              </h3>
              <div className="contact-grid">
                <div className="contact-item">
                  <div className="contact-icon">
                    <MailOutlined />
                  </div>
                  <div>
                    <div className="opacity-80">Email us at</div>
                    <div className="contact-text">feedback@promptcue.com</div>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon">
                    <HomeOutlined />
                  </div>
                  <div>
                    <div className="opacity-80">Visit our Roadmap</div>
                    <div className="contact-text">roadmap.promptcue.com</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WhatsNewPageLayout;
