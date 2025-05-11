import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { Input, Button, Select, Empty, Space, Typography, App } from "antd";
import {
  PlusOutlined,
  BookOutlined,
  DatabaseOutlined,
  ClockCircleOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  UpSquareOutlined,
} from "@ant-design/icons";
import PromptCard from "./PromptCard";
import BuiltInPromptsModal from "./BuiltInPromptsModal";
import AddCustomPromptModal from "./AddCustomPromptModal";
import { Prompt, PromptLibraryProps } from "./types";
import "./PromptLibrary.css";
import { featureUsageLogger } from "../../utils/featureUsageLogger";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const PromptLibrary: React.FC<PromptLibraryProps> = ({ onViewChange }) => {
  const { startNewChat } = useApp();
  const [prompts, setPrompts] = useState<Prompt[]>(() => {
    const savedPrompts = localStorage.getItem("PC_customPrompts");
    return savedPrompts ? JSON.parse(savedPrompts) : [];
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [isBuiltInModalVisible, setIsBuiltInModalVisible] = useState(false);
  const [isAddCustomModalVisible, setIsAddCustomModalVisible] = useState(false);
  const { message } = App.useApp();

  useEffect(() => {
    if (prompts.length > 0 || localStorage.getItem("PC_customPrompts")) {
      localStorage.setItem("PC_customPrompts", JSON.stringify(prompts));
    }
  }, [prompts]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handleAddPrompt = (prompt: Prompt) => {
    setPrompts((prevPrompts) => [
      ...prevPrompts,
      { ...prompt, id: Date.now().toString() },
    ]);
    featureUsageLogger({
      featureName: "prompt_library",
      eventType: "add_prompt",
      eventMetadata: {
        isBuiltin: prompt.isBuiltIn,
      },
    });
    message.success("Prompt added successfully");
  };

  const handleEditPrompt = (editedPrompt: Prompt) => {
    setPrompts((prevPrompts) =>
      prevPrompts.map((p) => (p.id === editedPrompt.id ? editedPrompt : p)),
    );
    message.success("Prompt updated successfully");
  };

  const handleDeletePrompt = (promptId: string) => {
    setPrompts((prevPrompts) => prevPrompts.filter((p) => p.id !== promptId));
    message.success("Prompt deleted successfully");
  };

  const handleTogglePin = (prompt: Prompt) => {
    setPrompts((prevPrompts) =>
      prevPrompts.map((p) =>
        p.id === prompt.id ? { ...p, isPinned: !p.isPinned } : p,
      ),
    );
  };

  const handleUseNow = (prompt: Prompt) => {
    localStorage.setItem("PC_currentPrompt", prompt.content);
    if (onViewChange) {
      startNewChat();
      onViewChange("chats");
    }
  };

  const sortPrompts = (prompts: Prompt[]) => {
    // First separate pinned and unpinned prompts
    const pinnedPrompts = prompts.filter((p) => p.isPinned);
    const unpinnedPrompts = prompts.filter((p) => !p.isPinned);

    // Sort each group based on the selected sorting option
    const sortFn = (a: Prompt, b: Prompt) => {
      switch (sortBy) {
        case "az":
          return a.title.localeCompare(b.title);
        case "za":
          return b.title.localeCompare(a.title);
        case "recent":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "yours":
          if (a.source === "You" && b.source !== "You") return -1;
          if (a.source !== "You" && b.source === "You") return 1;
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        default:
          return 0;
      }
    };

    return [...pinnedPrompts.sort(sortFn), ...unpinnedPrompts.sort(sortFn)];
  };

  const filteredAndSortedPrompts = sortPrompts(
    prompts.filter(
      (prompt) =>
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.content.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  return (
    <div className="prompt-library-container">
      <div className="prompt-library-header">
        <Space align="center" size={16}>
          <BookOutlined style={{ fontSize: "20px" }} />
          <div>
            <Title level={2}>Prompt Library</Title>
            <Text type="secondary">
              Your Go-To Hub for Custom & Ready-Made AI Prompts
            </Text>
          </div>
        </Space>
        <div className="prompt-library-actions">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsAddCustomModalVisible(true)}
          >
            {window.innerWidth > 786 ? "Add Custom Prompt" : "Add"}
          </Button>
          <Button
            icon={<DatabaseOutlined />}
            onClick={() => setIsBuiltInModalVisible(true)}
          >
            {window.innerWidth > 786
              ? "Browse Built-in Prompts"
              : "Browse Built-in"}
          </Button>
        </div>
      </div>

      <div className="prompt-library-filters">
        <Search
          placeholder="Search prompts..."
          onSearch={handleSearch}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="prompt-search"
        />
        <div style={{ float: "right" }}>
          <Select
            defaultValue="recent"
            className="prompt-sort-by"
            onChange={handleSortChange}
          >
            <Option value="recent">
              <ClockCircleOutlined /> Recently Created
            </Option>
            <Option value="az">
              <SortAscendingOutlined /> A to Z
            </Option>
            <Option value="za">
              <SortDescendingOutlined /> Z to A
            </Option>
            <Option value="yours">
              <UpSquareOutlined /> Created By You First
            </Option>
          </Select>
        </div>
      </div>

      <div
        className={
          filteredAndSortedPrompts.length > 0 ? "prompt-cards-grid" : ""
        }
      >
        {filteredAndSortedPrompts.length > 0 ? (
          filteredAndSortedPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onEdit={handleEditPrompt}
              onDelete={handleDeletePrompt}
              onUseNow={handleUseNow}
              onTogglePin={handleTogglePin}
            />
          ))
        ) : (
          <Empty
            className="prompt-empty"
            description="No prompts have been added yet"
          />
        )}
      </div>

      <BuiltInPromptsModal
        visible={isBuiltInModalVisible}
        onClose={() => setIsBuiltInModalVisible(false)}
        onAdd={handleAddPrompt}
      />

      <AddCustomPromptModal
        visible={isAddCustomModalVisible}
        onClose={() => setIsAddCustomModalVisible(false)}
        onAdd={handleAddPrompt}
      />
    </div>
  );
};

export default PromptLibrary;
