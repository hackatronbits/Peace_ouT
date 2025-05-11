"use client";

import Link from "next/link";
import "../styles.css";

export default function SmartConvo() {
  const starters = [
    {
      icon: "💡",
      title: "Generate Ideas",
      description: "Brainstorm creative solutions and innovative concepts",
      examples: ["Startup ideas in AI", "Content strategy", "Product features"],
    },
    {
      icon: "🔍",
      title: "Analyze Content",
      description: "Deep dive into text, data, and complex topics",
      examples: ["Market research", "Document analysis", "Trend insights"],
    },
    {
      icon: "✍️",
      title: "Enhance Writing",
      description: "Polish and perfect your written content",
      examples: ["Email drafts", "Blog posts", "Documentation"],
    },
    {
      icon: "👨‍💻",
      title: "Code Assistant",
      description: "Get help with coding and development",
      examples: ["Debug code", "Optimize algorithms", "Learn concepts"],
    },
  ];

  return (
    <>
      {/* Smart Conversation Starters Section */}
      <section className="starters-section" id="starters">
        <h2>Smart Conversation Starters</h2>
        <p>Kickstart your AI journey with these powerful prompts</p>
        <div className="starters-grid">
          {starters.map((starter, index) => (
            <div key={index} className="starter-card">
              <div className="starter-icon">{starter.icon}</div>
              <div className="starter-content">
                <h3>{starter.title}</h3>
                <p>{starter.description}</p>
                <div className="starter-examples">
                  {starter.examples.map((example, i) => (
                    <span key={i} className="example-tag">
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <Link className="more-starters-btn" href="/conversations">
          Explore More Starters
          <span className="btn-icon">+</span>
        </Link>
      </section>
    </>
  );
}
