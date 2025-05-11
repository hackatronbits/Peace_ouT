"use client";
import React, { useState } from "react";
import { Input, Menu, Select, Button, Tooltip } from "antd";
import {
  SearchOutlined,
  BookOutlined,
  ApiOutlined,
  ToolOutlined,
  RocketOutlined,
  CodeOutlined,
  QuestionCircleOutlined,
  GithubOutlined,
  ThunderboltOutlined,
  StarOutlined,
  RightOutlined,
} from "@ant-design/icons";
import Header from "../../../components/Navigation/Header/Header";
import Footer from "../../../components/Navigation/Footer/Footer";
import "./style.css";

const DocsPage = () => {
  const [selectedKey, setSelectedKey] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");

  const menuItems = [
    {
      key: "getting-started",
      label: "Getting Started",
      icon: <RocketOutlined />,
      children: [
        { key: "overview", label: "Overview" },
        { key: "quickstart", label: "Quick Start" },
        { key: "installation", label: "Installation" },
        { key: "authentication", label: "Authentication" },
      ],
    },
    {
      key: "core-concepts",
      label: "Core Concepts",
      icon: <BookOutlined />,
      children: [
        { key: "ai-models", label: "AI Models" },
        { key: "model-settings", label: "Model Settings" },
        { key: "chat-history", label: "Chat History" },
        { key: "best-practices", label: "Best Practices" },
      ],
    },
    {
      key: "ai-agents",
      label: "AI Agents",
      icon: <ToolOutlined />,
      children: [
        { key: "tech-agent", label: "Tech Agent (Jordan)" },
        { key: "research-agent", label: "Research Agent (Scott)" },
        { key: "agent-config", label: "Agent Configuration" },
        { key: "custom-agents", label: "Custom Agents" },
      ],
    },
    {
      key: "api-reference",
      label: "API Reference",
      icon: <ApiOutlined />,
      children: [
        { key: "api-auth", label: "Authentication" },
        { key: "chat-endpoints", label: "Chat Endpoints" },
        { key: "agent-endpoints", label: "Agent Endpoints" },
        { key: "rate-limits", label: "Rate Limits" },
      ],
    },
    {
      key: "sdks",
      label: "SDKs & Tools",
      icon: <CodeOutlined />,
      children: [
        { key: "javascript-sdk", label: "JavaScript" },
        { key: "python-sdk", label: "Python" },
        { key: "cli-tool", label: "CLI Tool" },
      ],
    },
  ];

  const renderCodeExample = (language: string) => {
    const examples = {
      javascript: `
const promptcue = require('promptcue');

// Initialize the client
const client = new promptcue.Client({
    apiKey: 'your-api-key'
});

// Create a chat completion
async function chatWithAI() {
    const response = await client.chat.create({
        model: 'gpt-4',
        messages: [
            { role: 'user', content: 'Hello, how can you help me?' }
        ]
    });
    
    console.log(response.content);
}`,
      python: `
import promptcue

# Initialize the client
client = promptcue.Client(api_key='your-api-key')

# Create a chat completion
def chat_with_ai():
    response = client.chat.create(
        model='gpt-4',
        messages=[
            {'role': 'user', 'content': 'Hello, how can you help me?'}
        ]
    )
    
    print(response.content)`,
    };

    return examples[language as keyof typeof examples] || examples.javascript;
  };

  return (
    <div className="docs-page">
      <Header />

      <div className="docs-hero">
        <div className="docs-hero-content">
          <h1>Documentation</h1>
          <p>Learn how to integrate and use PromptCue in your applications</p>
          <div className="docs-search">
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <main className="docs-container">
        <aside className="docs-sidebar">
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            defaultOpenKeys={["getting-started"]}
            items={menuItems}
            onClick={({ key }) => setSelectedKey(key)}
          />
        </aside>

        <div className="docs-content">
          <article className="docs-article">
            <div className="article-header">
              <h1>Overview</h1>
              <div className="article-meta">
                <Tooltip title="Edit on GitHub">
                  <Button icon={<GithubOutlined />} href="#" target="_blank">
                    Edit
                  </Button>
                </Tooltip>
              </div>
            </div>

            <section className="quick-links">
              <h2>Quick Links</h2>
              <div className="quick-links-grid">
                <a href="#" className="quick-link-card">
                  <ThunderboltOutlined />
                  <h3>Quick Start</h3>
                  <p>Get up and running in minutes</p>
                  <RightOutlined />
                </a>
                <a href="#" className="quick-link-card">
                  <StarOutlined />
                  <h3>Popular Guides</h3>
                  <p>Most viewed documentation</p>
                  <RightOutlined />
                </a>
                <a href="#" className="quick-link-card">
                  <ApiOutlined />
                  <h3>API Reference</h3>
                  <p>Detailed API documentation</p>
                  <RightOutlined />
                </a>
                <a href="#" className="quick-link-card">
                  <QuestionCircleOutlined />
                  <h3>FAQs</h3>
                  <p>Common questions answered</p>
                  <RightOutlined />
                </a>
              </div>
            </section>

            <section className="code-example">
              <div className="code-header">
                <h2>Quick Example</h2>
                <Select
                  value={selectedLanguage}
                  onChange={setSelectedLanguage}
                  options={[
                    { value: "javascript", label: "JavaScript" },
                    { value: "python", label: "Python" },
                  ]}
                />
              </div>
              <pre className="code-block">
                <code>{renderCodeExample(selectedLanguage)}</code>
              </pre>
            </section>

            <section className="next-steps">
              <h2>Next Steps</h2>
              <div className="next-steps-grid">
                <div className="next-step-card">
                  <h3>1. Install SDK</h3>
                  <p>Install our SDK using npm or pip</p>
                  <a href="#">
                    Get Started <RightOutlined />
                  </a>
                </div>
                <div className="next-step-card">
                  <h3>2. Authentication</h3>
                  <p>Set up your API keys</p>
                  <a href="#">
                    Learn More <RightOutlined />
                  </a>
                </div>
                <div className="next-step-card">
                  <h3>3. Make Your First Call</h3>
                  <p>Send your first API request</p>
                  <a href="#">
                    Try it Out <RightOutlined />
                  </a>
                </div>
              </div>
            </section>
          </article>

          <nav className="docs-nav">
            <div className="prev-next-links">
              <Button type="text" icon={<RightOutlined />}>
                Next: Quick Start Guide
              </Button>
            </div>
          </nav>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DocsPage;
