"use client";

import React from "react";
import { Typography, Row, Col, Card } from "antd";
import {
  RocketOutlined,
  BulbOutlined,
  HeartOutlined,
  TeamOutlined,
  SafetyOutlined,
  CodeOutlined,
} from "@ant-design/icons";
import Header from "../../../components/Navigation/Header/Header";
import Footer from "../../../components/Navigation/Footer/Footer";
import "./about.css";
import Link from "next/link";

const { Title, Paragraph, Text } = Typography;

const AboutPageLayout = () => {
  return (
    <div className="about-container">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="particles">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="particle" />
            ))}
          </div>
          <div className="content-wrapper">
            <Title level={1}>Reimagining AI Interaction</Title>
            <Paragraph className="hero-text">
              We&apos;re a passionate startup on a mission to make AI more
              accessible and intuitive for everyone. PromptCue is your gateway
              to seamless AI interactions.
            </Paragraph>
          </div>
        </section>

        {/* Mission Section */}
        <section className="mission-section">
          <div className="mission-content">
            <div className="mission-text">
              <Title level={2}>Our Mission</Title>
              <Paragraph>
                We believe that AI should be accessible to everyone, not just
                tech giants and large corporations. That&apos;s why we&apos;re
                building tools that make AI interactions natural, efficient, and
                powerful.
              </Paragraph>
            </div>

            <div className="mission-cards">
              <div className="mission-card">
                <div className="card-icon">
                  <RocketOutlined />
                </div>
                <h3>Launch Phase</h3>
                <p>Join our early access program</p>
              </div>

              <div className="mission-card">
                <div className="card-icon">
                  <HeartOutlined />
                </div>
                <h3>User-Focused</h3>
                <p>Built with your needs in mind</p>
              </div>

              <div className="mission-card">
                <div className="card-icon">
                  <TeamOutlined />
                </div>
                <h3>Growing Community</h3>
                <p>Be part of our journey</p>
                <Link href="/conversations">
                  <button className="get-started-btn">
                    Get Started
                    <span className="btn-arrow">→</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="values-section">
          <div className="content-wrapper">
            <Title level={2} className="section-title">
              Our Principles
            </Title>
            <Row gutter={[32, 32]}>
              <Col xs={24} md={8}>
                <Card className="value-card">
                  <BulbOutlined className="stat-icon" />
                  <Title level={3}>Innovation</Title>
                  <Paragraph>
                    We&apos;re not just following trends - we&apos;re setting
                    them with features like voice commands and dynamic prompts.
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card className="value-card">
                  <SafetyOutlined className="stat-icon" />
                  <Title level={3}>Trust</Title>
                  <Paragraph>
                    Your data privacy and security are fundamental to everything
                    we build.
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card className="value-card">
                  <CodeOutlined className="stat-icon" />
                  <Title level={3}>Simplicity</Title>
                  <Paragraph>
                    Complex technology doesn&apos;t have to be complicated to
                    use.
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </div>
        </section>

        {/* Features Section */}
        <section className="tech-section">
          <div className="content-wrapper">
            <Row gutter={[48, 48]} align="middle">
              <Col xs={24} md={12}>
                <Title level={2}>What Makes Us Different</Title>
                <Paragraph>
                  We&apos;re launching with features that matter:
                </Paragraph>
                <ul className="tech-list">
                  <li>Voice Commands & Speech-to-Text</li>
                  <li>Specialized AI Agents</li>
                  <li>Dynamic Prompt Variables</li>
                  <li>Smart Chat Organization</li>
                </ul>
              </Col>
              <Col xs={24} md={12}>
                <div className="tech-illustration">
                  <div className="code-window">
                    <div className="window-header">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </div>
                    <div className="window-content">
                      <pre>
                        <code>
                          {`// Example: Dynamic Prompts
const response = await ai.chat({
  prompt: "Analyze __$code for bugs",
  variables: {
    code: selectedCode
  }
});`}
                        </code>
                      </pre>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </section>

        {/* Vision Section */}
        <section className="vision-section">
          <div className="particles">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="particle" />
            ))}
          </div>
          <div className="content-wrapper">
            <Title level={2}>Join Our Journey</Title>
            <Paragraph className="vision-text">
              We&apos;re at the beginning of an exciting journey to transform
              how people interact with AI. As an early-stage startup, we value
              every user who joins us on this adventure. Your feedback and
              support will help shape the future of AI interaction.
            </Paragraph>
            <Link href="/conversations">
              <button className="get-started-btn vision-cta">
                Get Started
                <span className="btn-arrow">→</span>
              </button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPageLayout;
