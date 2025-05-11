"use client";

import "../styles.css";

export default function SupportedModels() {
  return (
    <>
      {/* Models Section */}
      <section className="models-section" id="models">
        <h2>Supported AI Models</h2>
        <p>
          Connect with the world&apos;s most powerful AI models through our
          unified interface. Experience seamless conversations with
          industry-leading language models.
        </p>
        <div className="models-grid">
          <div className="model-card">
            <div className="supported-model-icon">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="32"
                height="32"
              >
                <path d="M21.4 7.5c.8.8 1.2 1.9 1.2 3s-.4 2.2-1.2 3l-3 3c-.8.8-1.9 1.2-3 1.2s-2.2-.4-3-1.2c-.8-.8-1.2-1.9-1.2-3s.4-2.2 1.2-3l1.5-1.5" />
                <path d="M3.9 12c0-1.1.4-2.2 1.2-3l3-3c.8-.8 1.9-1.2 3-1.2s2.2.4 3 1.2c.8.8 1.2 1.9 1.2 3s-.4 2.2-1.2 3l-1.5 1.5" />
              </svg>
            </div>
            <h3>OpenAI</h3>
            <p className="model-description">
              Access GPT-4 and GPT-3.5 models with advanced capabilities for
              natural language understanding and generation.
            </p>
            <div className="model-features">
              <span>GPT-4o-Mini</span>
              <span>GPT-4o</span>
              <span>ChatGPT-4o Latest</span>
              <span>o1 and o1 Mini</span>
            </div>
          </div>

          <div className="model-card">
            <div className="supported-model-icon">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="32"
                height="32"
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </div>
            <h3>Google</h3>
            <p className="model-description">
              Leverage Google&apos;s Gemini models for state-of-the-art language
              processing and multimodal capabilities.
            </p>
            <div className="model-features">
              <span>Gemini 2.0 Flash Experimental</span>
              <span>Gemini 1.5 Pro</span>
              <span>Gemini 1.5 Flash</span>
            </div>
          </div>

          <div className="model-card">
            <div className="supported-model-icon">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="32"
                height="32"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-2.21 0-4-1.79-4-4h8c0 2.21-1.79 4-4 4z" />
              </svg>
            </div>
            <h3>Anthropic</h3>
            <p className="model-description">
              Engage with Claude, known for its exceptional reasoning and
              analysis capabilities.
            </p>
            <div className="model-features">
              <span>Claude 3.5 Sonnet</span>
              <span>Claude 3.5 Haiku</span>
              <span>Claude 3 Opus</span>
            </div>
          </div>

          <div className="model-card">
            <div className="supported-model-icon">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="32"
                height="32"
              >
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
              </svg>
            </div>
            <h3>Ollama</h3>
            <p className="model-description">
              Run powerful open-source models locally with high performance and
              complete privacy.
            </p>
            <div className="model-features">
              <span>Mistral (Latest)</span>
              <span>Mixtral (8x7b)</span>
              <span>Llama 2/3.3</span>
            </div>
          </div>

          <div className="model-card">
            <div className="supported-model-icon">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="32"
                height="32"
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </div>
            <h3>DeepSeek</h3>
            <p className="model-description">
              Experience cutting-edge language models with impressive
              performance and efficiency.
            </p>
            <div className="model-features">
              <span>DeepSeek Chat (V3)</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
