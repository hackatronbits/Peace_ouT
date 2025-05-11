"use client";

import React from "react";
import { Typography } from "antd";
import {
  FileProtectOutlined,
  SafetyOutlined,
  DollarOutlined,
  WarningOutlined,
  MailOutlined,
  HomeOutlined,
  RobotOutlined,
  KeyOutlined,
  LockOutlined,
} from "@ant-design/icons";
import "../../info/info-pages.css";
import Header from "../../../components/Navigation/Header/Header";
import Footer from "../../../components/Navigation/Footer/Footer";

const { Paragraph } = Typography;

const termsData = [
  {
    key: "1",
    title: "Service Agreement",
    icon: <RobotOutlined />,
    content: `By accessing and using PromptCue's AI services, you agree to these Terms and Conditions. Our platform provides access to various AI models, Speech-to-Text capabilities, and AI Agents through API integration. These terms constitute a legally binding agreement between you and PromptCue. If you don't agree with any part of these terms, please do not use our services.`,
  },
  {
    key: "2",
    title: "API Keys and Security",
    icon: <KeyOutlined />,
    content: [
      "You are responsible for maintaining the security of your API keys",
      "Never share your API keys with unauthorized parties",
      "Report any suspected unauthorized use immediately",
      "We reserve the right to revoke API access for security violations",
      "Regularly rotate your API keys as a security best practice",
    ],
  },
  {
    key: "3",
    title: "AI Model Usage",
    icon: <RobotOutlined />,
    content: [
      "Access to AI models is subject to fair usage policies",
      "Do not use AI models for generating harmful or malicious content",
      "Speech-to-Text services must be used in compliance with privacy laws",
      "AI Agents should be used responsibly and ethically",
      "We reserve the right to monitor usage patterns for abuse prevention",
    ],
  },
  {
    key: "4",
    title: "Data and Privacy",
    icon: <LockOutlined />,
    content: [
      "We process and store data in accordance with our Privacy Policy",
      "User conversations with AI models may be logged for service improvement",
      "Speech data is processed securely and in compliance with GDPR/CCPA",
      "You retain ownership of your input content",
      "We implement industry-standard security measures to protect your data",
    ],
  },
  {
    key: "5",
    title: "Payment Terms",
    icon: <DollarOutlined />,
    content: [
      "Subscription fees are billed according to your chosen plan",
      "API usage beyond plan limits will incur additional charges",
      "All fees are non-refundable unless required by law",
      "We reserve the right to modify pricing with 30 days notice",
      "Failure to pay may result in service suspension",
    ],
  },
  {
    key: "6",
    title: "Service Limitations",
    icon: <WarningOutlined />,
    content: [
      "AI model responses may not always be accurate or reliable",
      "Speech-to-Text accuracy depends on audio quality and clarity",
      "Service availability is subject to maintenance and updates",
      "API rate limits apply to prevent system abuse",
      "We do not guarantee uninterrupted service availability",
    ],
  },
  {
    key: "7",
    title: "Intellectual Property",
    icon: <FileProtectOutlined />,
    content: [
      "You retain rights to your input content",
      "AI-generated outputs may have shared ownership",
      "Our platform and AI models are protected by intellectual property laws",
      "Do not reverse engineer or attempt to extract our AI models",
      "Respect third-party intellectual property rights when using our service",
    ],
  },
  {
    key: "8",
    title: "Compliance",
    icon: <SafetyOutlined />,
    content: [
      "Users must comply with all applicable laws and regulations",
      "Do not use our services for illegal or prohibited activities",
      "Report any compliance concerns to our legal team",
      "We cooperate with law enforcement when legally required",
      "Users must be at least 18 years old or have guardian consent",
    ],
  },
  {
    key: "9",
    title: "Termination",
    icon: <WarningOutlined />,
    content: [
      "We may terminate service for terms violations",
      "Users can cancel their subscription at any time",
      "Upon termination, API access will be immediately revoked",
      "You are responsible for extracting your data before account closure",
      "Certain terms survive service termination",
    ],
  },
];

const TermsAndConditionsLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <div className="info-page-container">
          <div className="info-content">
            <div className="page-header">
              <div className="page-icon">
                <FileProtectOutlined />
              </div>
              <div>
                <h1 className="page-title">Terms & Conditions</h1>
                <p className="page-subtitle">
                  Understanding your rights and responsibilities
                </p>
              </div>
            </div>

            <div className="info-card">
              <Paragraph className="text-lg">
                Welcome to PromptCue. These Terms and Conditions govern your use
                of our AI platform and services. We provide access to various AI
                models, Speech-to-Text capabilities, and AI Agents through our
                API integration. By using our services, you agree to these
                terms. Please read them carefully.
              </Paragraph>
            </div>

            <div className="space-y-6">
              {termsData.map((term, index) => (
                <div key={term.key} className="info-card">
                  <div className="card-header">
                    <div className="card-icon">{term.icon}</div>
                    <h2 className="card-title">{term.title}</h2>
                  </div>

                  {Array.isArray(term.content) ? (
                    <ul className="info-list">
                      {term.content.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <Paragraph>{term.content}</Paragraph>
                  )}
                </div>
              ))}
            </div>

            <div className="contact-section">
              <h3 className="text-2xl font-bold mb-6">
                Questions About Our Terms?
              </h3>
              <div className="contact-grid">
                <div className="contact-item">
                  <div className="contact-icon">
                    <MailOutlined />
                  </div>
                  <div>
                    <div className="opacity-80">Email us at</div>
                    <div className="contact-text">legal@promptcue.com</div>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon">
                    <HomeOutlined />
                  </div>
                  <div>
                    <div className="opacity-80">Visit us at</div>
                    <div className="contact-text">support.promptcue.com</div>
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

export default TermsAndConditionsLayout;
