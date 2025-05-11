"use client";

import Link from "next/link";
import "../styles.css";

export default function Hero() {
  // Smooth scroll function
  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Supercharge Your{" "}
            <span className="gradient-text">AI Interactions</span>
          </h1>
          <p className="hero-subtitle">
            One powerful interface for all your AI needs. Voice commands,
            dynamic prompts, and specialized agents make AI more accessible than
            ever.
          </p>
          <div className="hero-buttons">
            <Link href="/conversations" className="button-primary">
              Get Started
              <svg
                className="button-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
            <Link
              href="#features"
              className="button-secondary"
              onClick={(e) => scrollToSection(e, "features")}
            >
              See Features
              <svg
                className="button-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Browser Window */}
        {window.innerWidth > 768 && (
          <div className="browser-window">
            <div className="browser-header">
              <div className="window-controls">
                <div className="control close"></div>
                <div className="control minimize"></div>
                <div className="control maximize"></div>
              </div>
              <div className="browser-address-bar">
                <span className="lock-icon">🔒</span>
                promptcue.com/conversations
              </div>
            </div>
            <div className="browser-content">
              {/* Primary Sidebar */}
              <aside className="app-sidebar primary">
                <div className="sidebar-item active">💬</div>
                <div className="sidebar-item">🔖</div>
                <div className="sidebar-item">🤖</div>
                <div className="sidebar-item">⚙️</div>
              </aside>

              {/* Secondary Sidebar */}
              <aside className="app-sidebar secondary">
                <div className="sidebar-controls">
                  <button className="new-chat-button">
                    <span className="plus-icon">+</span>
                    New Chat
                  </button>
                  <div className="search-container">
                    <input
                      type="text"
                      placeholder="Search chats..."
                      className="search-design-input"
                    />
                    <span className="search-icon">🔍</span>
                  </div>
                  <div className="ops-container">
                    <button className="sort-button">
                      <span className="sort-icon">↓↑</span>
                    </button>
                    <button className="archive-button">
                      <span className="sort-icon">📨</span>
                    </button>
                    <button className="folders-button">
                      <span className="sort-icon">📂</span>
                    </button>
                  </div>
                </div>
                <div className="chat-list">
                  <div className="chat-design-item active">
                    <div className="chat-design-item-content">
                      <div className="model-tag">GPT-4</div>
                      <div className="chat-info">
                        <div className="chat-design-title">AI Development</div>
                        <div className="chat-design-preview">
                          Discussing LLM architect...
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="chat-design-item">
                    <div className="chat-design-item-content">
                      <div className="model-tag gemini">🤖 Scott</div>
                      <div className="chat-info">
                        <div className="chat-design-title">Data Analysis</div>
                        <div className="chat-design-preview">
                          Analyzing Q4 2024 market...
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="chat-design-item">
                    <div className="chat-design-item-content">
                      <div className="model-tag claude">Claude</div>
                      <div className="chat-info">
                        <div className="chat-design-title">Code Review</div>
                        <div className="chat-design-preview">
                          Reviewing the new authenti...
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Chat Section */}
              <section className="chat-section">
                <div className="chat-design-header">
                  <div className="model-selector">
                    <button className="selected-model">
                      <div className="model-badge">
                        <span className="model-dot"></span>
                        GPT-4o-Mini
                      </div>
                      <svg
                        className="dropdown-arrow"
                        width="10"
                        height="6"
                        viewBox="0 0 10 6"
                      >
                        <path
                          d="M1 1L5 5L9 1"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          fill="none"
                        />
                      </svg>
                    </button>
                    <div className="model-dropdown">
                      <div className="dropdown-header">Select AI Model</div>
                      <div className="model-design-options">
                        <div className="model-design-option active">
                          <div className="model-design-option-content">
                            <div className="model-badge">
                              <span className="model-dot gpt"></span>
                              GPT-4o-Mini
                            </div>
                          </div>
                          <svg
                            className="check-icon"
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                          >
                            <path
                              d="M13.5 4.5l-7 7L3 8"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="none"
                            />
                          </svg>
                        </div>
                        <div className="model-design-option">
                          <div className="model-design-option-content">
                            <div className="model-badge">
                              <span className="model-dot gemini"></span>
                              Gemini 1.5
                            </div>
                          </div>
                        </div>
                        <div className="model-design-option">
                          <div className="model-design-option-content">
                            <div className="model-badge">
                              <span className="model-dot claude"></span>
                              Claude 3
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="chat-messages">
                  <div className="message assistant">
                    <div className="message-content">
                      Hello! I&apos;m your AI assistant. I can help you with
                      coding, data analysis, content creation, and much more.
                      What would you like to work on today?
                    </div>
                  </div>
                  <div className="message user">
                    <div className="message-content">
                      I&apos;m working on a new React project and need help with
                      state management. Can you explain the best practices for
                      using Context API vs Redux?
                    </div>
                  </div>
                  <div className="message assistant">
                    <div className="message-content">
                      Great question! Let me break down the key differences and
                      use cases for Context API and Redux: 1. Context API is
                      best for: - Simple state that doesn&apos;t change often -
                      Passing data through multiple components - Small to
                      medium-sized applications 2. Redux is more suitable when
                      you need: - Complex state management - Middleware for side
                      effects - Dev tools for debugging - Predictable state
                      updates Which aspects would you like me to elaborate on?
                    </div>
                  </div>
                </div>

                <div className="chat-input">
                  <div className="input-box-demo">
                    <textarea
                      placeholder="Type your message here..."
                      rows={1}
                    ></textarea>
                    <button className="send-button">➤</button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
