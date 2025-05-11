"use client";

import { CodeOutlined } from "@ant-design/icons";
import "../styles.css";

export default function Features() {
  const features = [
    {
      icon: "🤖",
      title: "AI Agents",
      description:
        "Specialized AI agents for technical and research tasks, providing expert assistance in their respective domains.",
      benefits: ["Technical Help", "Research Assistance", "Domain Expertise"],
    },
    {
      icon: <CodeOutlined />,
      title: "Dynamic Prompts",
      description:
        "Enhance your prompts with dynamic variables using __$ syntax for more flexible and powerful AI interactions.",
      benefits: [
        "Variable Substitution",
        "Dynamic Inputs",
        "Reusable Patterns",
      ],
    },
    {
      icon: "🎙️",
      title: "Voice Interaction",
      description:
        "Natural speech-to-text capabilities for hands-free AI interaction and enhanced accessibility.",
      benefits: ["Voice Commands", "Transcription", "Hands-Free Use"],
    },
    {
      icon: "📊",
      title: "Usage Analytics",
      description:
        "Comprehensive insights into your AI interactions with detailed metrics and usage patterns.",
      benefits: ["Response Analytics", "Storage Analysis", "Usage Patterns"],
    },
    {
      icon: "📂",
      title: "Chat Organization",
      description:
        "Powerful chat management with archiving, pinning, and temporary conversations for optimal workflow.",
      benefits: ["Archive & Pin", "Quick Search", "Temporary Chats"],
    },
    {
      icon: "⚙️",
      title: "Custom Model Settings",
      description:
        "Fine-tune AI behavior with advanced parameters for precise control over responses and interactions.",
      benefits: ["Temperature Control", "Context Length", "Response Tuning"],
    },
  ];

  return (
    <>
      {/* Features Section */}
      <section className="features-section" id="features">
        <h2>Platform Features</h2>
        <p>
          Experience the next generation of AI interaction with our powerful
          features designed to make AI more accessible and efficient than ever.
        </p>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-header">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
              </div>
              <p className="feature-description">{feature.description}</p>
              <div className="feature-benefits">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <div key={benefitIndex} className="feature-benefit">
                    <div className="benefit-icon">✓</div>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
