"use client";

import Link from "next/link";
import "../styles.css";

export default function ReadyToStart() {
  return (
    <>
      {/* Ready to Start Section */}
      <section className="ready-section">
        <div className="ready-container">
          <div className="ready-content">
            <h2>Ready to Transform Your AI Experience?</h2>
            <p>
              Start chatting with our advanced AI models and discover a new way
              of interaction
            </p>
            <div className="ready-actions">
              <Link href="/conversations" className="start-button">
                Launch PromptCue
                <span className="button-icon">→</span>
              </Link>
              <div className="ready-features">
                <div className="ready-feature">
                  <span className="feature-check">✓</span>
                  No signup required
                </div>
                <div className="ready-feature">
                  <span className="feature-check">✓</span>
                  Free to start
                </div>
                <div className="ready-feature">
                  <span className="feature-check">✓</span>
                  Instant access
                </div>
              </div>
            </div>
          </div>
          <div className="ready-decoration">
            <div className="chat-interface">
              <div className="chat-window">
                <div className="chat-messages">
                  <div className="message user-message">
                    <div className="message-content-launch">
                      How can you help me?
                    </div>
                  </div>
                  <div className="message ai-message">
                    <div className="message-content-launch">
                      I can assist with coding, writing, and analysis.
                    </div>
                  </div>
                  <div className="message user-message">
                    <div className="message-content-launch">
                      Great! Let&apos;s start coding.
                    </div>
                  </div>
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
                <div className="chat-input">
                  <div className="input-field">Type your message...</div>
                  <div className="send-button">→</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
