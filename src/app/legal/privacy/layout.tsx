"use client";

import React from "react";
import { Typography } from "antd";
import {
  SafetyCertificateOutlined,
  UserOutlined,
  DatabaseOutlined,
  SafetyOutlined,
  GlobalOutlined,
  CloudOutlined,
  LockOutlined,
  TeamOutlined,
  MailOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import "../../info/info-pages.css";
import Header from "../../../components/Navigation/Header/Header";
import Footer from "../../../components/Navigation/Footer/Footer";

const { Title, Paragraph, Text } = Typography;

const privacyData = [
  {
    key: "1",
    title: "Information We Collect",
    icon: <DatabaseOutlined />,
    content: [
      "API keys and authentication credentials",
      "User-provided content and prompts",
      "Speech data for Speech-to-Text processing",
      "Usage patterns and interaction history",
      "Technical data such as IP address and device information",
    ],
  },
  {
    key: "2",
    title: "How We Use Your Data",
    icon: <CloudOutlined />,
    content: [
      "Providing and improving our AI services",
      "Processing Speech-to-Text conversions",
      "Training and fine-tuning AI models (with consent)",
      "Analyzing usage patterns for service optimization",
      "Ensuring platform security and preventing abuse",
    ],
  },
  {
    key: "3",
    title: "Data Security",
    icon: <LockOutlined />,
    content: [
      "Industry-standard encryption for data transmission",
      "Secure storage of API keys and credentials",
      "Regular security audits and penetration testing",
      "Access controls and authentication measures",
      "Automated threat detection and prevention",
    ],
  },
  {
    key: "4",
    title: "Data Sharing",
    icon: <TeamOutlined />,
    content: [
      "Limited sharing with AI model providers",
      "Service providers for platform operations",
      "Legal requirements and law enforcement",
      "No selling of personal data to third parties",
      "Anonymous data for research and development",
    ],
  },
  {
    key: "5",
    title: "Your Privacy Rights",
    icon: <UserOutlined />,
    content: [
      "Access your stored data and usage history",
      "Request data export or deletion",
      "Opt-out of model training contributions",
      "Control data retention preferences",
      "Update or correct your information",
    ],
  },
  {
    key: "6",
    title: "AI Model Privacy",
    icon: <SafetyCertificateOutlined />,
    content: [
      "AI interactions are logged for quality assurance",
      "Model outputs may be reviewed for safety",
      "Training data is anonymized when possible",
      "You control the publicity of your AI interactions",
      "Option to use private AI instances",
    ],
  },
  {
    key: "7",
    title: "International Data Transfer",
    icon: <GlobalOutlined />,
    content: [
      "Data may be processed in different countries",
      "Compliance with international privacy laws",
      "EU-US Privacy Shield Framework adherence",
      "Standard contractual clauses for transfers",
      "Regional data center options available",
    ],
  },
  {
    key: "8",
    title: "Compliance",
    icon: <SafetyOutlined />,
    content: [
      "GDPR and CCPA compliance measures",
      "Regular privacy impact assessments",
      "Data protection officer appointment",
      "Privacy by design principles",
      "Regular policy updates and notifications",
    ],
  },
];

const PrivacyPolicyLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <div className="info-page-container">
          <div className="info-content">
            <div className="page-header">
              <div className="page-icon">
                <SafetyCertificateOutlined />
              </div>
              <div>
                <h1 className="page-title">Privacy Policy</h1>
                <p className="page-subtitle">
                  How we protect and handle your data
                </p>
              </div>
            </div>

            <div className="info-card">
              <Paragraph className="text-lg">
                At PromptCue, we take your privacy seriously. This Privacy
                Policy explains how we collect, use, and protect your personal
                information when you use our AI models, Speech-to-Text services,
                and AI Agents. We are committed to ensuring the security and
                confidentiality of your data while providing transparent
                information about our privacy practices.
              </Paragraph>
            </div>

            <div className="space-y-6">
              {privacyData.map((item, index) => (
                <div key={item.key} className="info-card">
                  <div className="card-header">
                    <div className="card-icon">{item.icon}</div>
                    <h2 className="card-title">{item.title}</h2>
                  </div>

                  {Array.isArray(item.content) ? (
                    <ul className="info-list">
                      {item.content.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  ) : (
                    <Paragraph>{item.content}</Paragraph>
                  )}
                </div>
              ))}
            </div>

            <div className="contact-section">
              <h3 className="text-2xl font-bold mb-6">Privacy Questions?</h3>
              <div className="contact-grid">
                <div className="contact-item">
                  <div className="contact-icon">
                    <MailOutlined />
                  </div>
                  <div>
                    <div className="opacity-80">Email us at</div>
                    <div className="contact-text">privacy@promptcue.com</div>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon">
                    <HomeOutlined />
                  </div>
                  <div>
                    <div className="opacity-80">Visit our Help Center</div>
                    <div className="contact-text">help.promptcue.com</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-12 opacity-60">
              Last updated: January 18, 2025
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicyLayout;
