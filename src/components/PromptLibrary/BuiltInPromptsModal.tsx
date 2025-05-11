import React, { useState, useEffect } from "react";
import { Modal, Input, Card, Button, Empty, Spin, App } from "antd";
import {
  CheckOutlined,
  DatabaseOutlined,
  ExportOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { BuiltInPromptsModalProps, Prompt } from "./types";
import "./PromptLibrary.css";

const { Search } = Input;

const BuiltInPromptsModal: React.FC<BuiltInPromptsModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const [builtInPrompts, setBuiltInPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { message } = App.useApp();

  useEffect(() => {
    if (visible) {
      fetchBuiltInPrompts();
    }
  }, [visible]);

  const fetchBuiltInPrompts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        "https://raw.githubusercontent.com/f/awesome-chatgpt-prompts/main/prompts.csv",
      );
      if (!response.ok) {
        throw new Error("Failed to fetch prompts");
      }

      const data = await response.text();

      // Parse CSV data and handle potential errors
      const lines = data.split("\n").filter((line) => line.trim());
      if (lines.length <= 1) {
        throw new Error("No prompts found in the data");
      }

      // Skip header row and parse the rest
      const prompts = lines
        .slice(1)
        .map((line) => {
          // Handle cases where the line might contain multiple commas within quotes
          const matches = line.match(/"([^"]*)","([^"]*)"/);
          if (!matches || matches.length < 3) {
            return null;
          }

          const [_, title, content] = matches;
          return {
            id: `built-in-${Date.now()}-${Math.random()}`,
            title: title.trim(),
            description: content.slice(0, 150) + "...",
            content: content.trim(),
            source: "ACP",
            createdAt: new Date().toISOString(),
            isBuiltIn: true,
          };
        })
        .filter((prompt) => prompt !== null) as Prompt[];

      if (prompts.length === 0) {
        throw new Error("No valid prompts found in the data");
      }

      setBuiltInPrompts(prompts);
      setError(null);
    } catch (error) {
      console.error("Error fetching built-in prompts:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load prompts",
      );
      setBuiltInPrompts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPrompt = (prompt: Prompt) => {
    const newPrompt = {
      ...prompt,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    onAdd(newPrompt);
    onClose();
  };

  const filteredPrompts = builtInPrompts.filter(
    (prompt) =>
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Modal
      title={
        <>
          <DatabaseOutlined /> Built-in Prompts
        </>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={950}
      className="prompt-modal"
    >
      <div style={{ marginBottom: "24px", textAlign: "center" }}>
        <Search
          placeholder="Search built-in prompts..."
          onChange={(e) => setSearchQuery(e.target.value)}
          className="prompt-search"
        />
      </div>

      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : error ? (
        <div className="loading-container">
          <div style={{ textAlign: "center", color: "red", padding: "20px" }}>
            {error}
          </div>
        </div>
      ) : (
        <div className="built-in-prompts-grid">
          {filteredPrompts.length > 0 ? (
            filteredPrompts.map((prompt) => (
              <Card
                key={prompt.id}
                className="prompt-card"
                actions={[
                  <>
                    {JSON.parse(
                      localStorage.getItem("PC_customPrompts") || "[]",
                    ).some((p: Prompt) => p.title === prompt.title) ? (
                      <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        disabled={true}
                      >
                        Added to Library
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => handleAddPrompt(prompt)}
                      >
                        Add to Library
                      </Button>
                    )}
                  </>,
                ]}
              >
                <div className="prompt-card-header">
                  <div className="prompt-card-title">{prompt.title}</div>
                  <div className="prompt-card-description">
                    <small>
                      Source:{" "}
                      <a href="https://github.com/f/awesome-chatgpt-prompts">
                        Awesome ChatGPT Prompts <ExportOutlined />
                      </a>
                    </small>
                  </div>
                </div>

                <div className="prompt-card-content">{prompt.description}</div>
              </Card>
            ))
          ) : (
            <Empty description="No prompts found" />
          )}
        </div>
      )}
    </Modal>
  );
};

export default BuiltInPromptsModal;
