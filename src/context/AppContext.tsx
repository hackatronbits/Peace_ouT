"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { validateModelApiKey } from "../config/modelConfig";
import LoadingScreen from "../components/LoadingScreen/LoadingScreen";
import NotFound from "../components/AppStatus/PageNotFound/NotFound";
import { logError, logInfo } from "../utils/logger";
import { App } from "antd";
import { featureUsageLogger } from "../utils/featureUsageLogger";

interface Message {
  responseTime: number;
  responseTokens: number;
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  timestamp: string;
  status: string;
  model?: string;
  mode: string;
  agentType: string;
}

interface Chat {
  id: string;
  messages: Message[];
  model?: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  isArchived?: boolean;
  isPinned?: boolean;
  pinnedAt?: number;
}

export interface TempMessage {
  content: string;
  role: "user" | "assistant";
  responseTime: number;
  responseTokens: number;
  model: string;
}

interface ProjectFolder {
  id: string;
  name: string;
  chatIds: string[];
  createdAt: string;
  isExpanded: boolean;
}

interface AppContextType {
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  toggleDarkMode: () => void;
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  activeChat: Chat | null;
  setActiveChat: React.Dispatch<React.SetStateAction<Chat | null>>;
  startNewChat: (folderId?: string) => void;
  addMessage: (
    messageData: Pick<Message, "content" | "role">,
    folderId?: string,
  ) => Chat | null;
  deleteMessage: (messageId: string) => Promise<void>;
  deleteTemporaryMessage: (index: number) => void;
  deleteChat: (chatId: string) => void;
  selectedModel: string;
  setSelectedModel: React.Dispatch<React.SetStateAction<string>>;
  apiKeys: Record<string, string>;
  setApiKeys: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  getModelApiKey: (model: string) => string | null;
  setModelApiKey: (model: string, key: string) => Promise<boolean>;
  mode: string;
  agentType: string;
  setMode: (mode: string) => void;
  setAgentType: (type: string) => void;
  resetAgentSettings: () => void;
  isTemporaryMode: boolean;
  setTemporaryMode: (value: boolean) => void;
  temporaryMessages: TempMessage[];
  setTemporaryMessages: React.Dispatch<React.SetStateAction<TempMessage[]>>;
  archiveChat: (id: string) => void;
  restoreChat: (id: string) => void;
  archivedChats: Chat[];
  exportChat: (chatId: string) => Promise<void>;
  togglePinChat: (chatId: string) => void;
  getPinnedChats: () => Chat[];
  getUnpinnedChats: () => Chat[];
  deleteMessagesAfterIndex: (
    messageId: string,
  ) => Promise<{ isSingleMessage: boolean }>;
  deleteTemporaryMessagesAfterIndex: (
    index: number,
  ) => Promise<{ isSingleMessage: boolean }>;
  projectFolders: ProjectFolder[];
  createProjectFolder: (name: string) => void;
  deleteProjectFolder: (id: string, deleteChats?: boolean) => void;
  renameProjectFolder: (id: string, newName: string) => void;
  addChatToFolder: (folderId: string, chatId: string) => void;
  removeChatFromFolder: (folderId: string, chatId: string) => void;
  toggleFolderExpansion: (folderId: string) => void;
  getFolderForChat: (chatId: string) => ProjectFolder | null;
}

const AppContext = createContext<AppContextType>({
  isDarkMode: false,
  setIsDarkMode: () => {},
  toggleDarkMode: () => {},
  chats: [],
  setChats: () => {},
  activeChat: null,
  setActiveChat: () => {},
  startNewChat: () => {},
  addMessage: () => {
    throw new Error("Not implemented");
  },
  deleteMessage: async () => {},
  deleteTemporaryMessage: () => {},
  deleteChat: () => {},
  selectedModel: "gpt-4o-mini",
  setSelectedModel: () => {},
  apiKeys: {},
  setApiKeys: () => {},
  getModelApiKey: () => null,
  setModelApiKey: async () => false,
  mode: "normal",
  agentType: "na",
  setMode: () => {},
  setAgentType: () => {},
  resetAgentSettings: () => {},
  isTemporaryMode: false,
  setTemporaryMode: () => {},
  temporaryMessages: [],
  setTemporaryMessages: () => {},
  archiveChat: () => {},
  restoreChat: () => {},
  archivedChats: [],
  exportChat: async () => {},
  togglePinChat: () => {},
  getPinnedChats: () => [],
  getUnpinnedChats: () => [],
  deleteMessagesAfterIndex: async () => ({ isSingleMessage: false }),
  deleteTemporaryMessagesAfterIndex: async () => ({ isSingleMessage: false }),
  projectFolders: [],
  createProjectFolder: () => {},
  deleteProjectFolder: (_id: string, _deleteChats?: boolean) => {},
  renameProjectFolder: () => {},
  addChatToFolder: () => {},
  removeChatFromFolder: () => {},
  toggleFolderExpansion: () => {},
  getFolderForChat: () => null,
});

// Utility function to safely access localStorage
const safeLocalStorage = {
  getItem: (key: string, defaultValue: string = "") => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem(key) || defaultValue;
      } catch (error) {
        console.error("Error accessing localStorage:", error);
        return defaultValue;
      }
    }
    return defaultValue;
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error("Error setting localStorage:", error);
      }
    }
  },
  removeItem: (key: string) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error("Error removing localStorage item:", error);
      }
    }
  },
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // States
  const [mounted, setMounted] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState<string>("/");
  const [mode, setMode] = useState<string>("normal");
  const [agentType, setAgentType] = useState<string>("na");
  const [isTemporaryMode, setIsTemporaryMode] = useState<boolean>(false);
  const [temporaryMessages, setTemporaryMessages] = useState<TempMessage[]>([]);
  const [projectFolders, setProjectFolders] = useState<ProjectFolder[]>(() => {
    const savedFolders = safeLocalStorage.getItem("PC_projectFolders", "[]");
    return JSON.parse(savedFolders);
  });
  const { message } = App.useApp();

  // Check if the current path exists in your app's routes
  const isValidRoute = (route: string) => {
    // Add all valid routes here
    const validRoutePatterns = [
      "/",
      "/chat",
      "/settings",
      "/info/*",
      "/company/*",
      "/product/*",
      "/legal/*",
      "/conversations",
    ]; // Add wildcard paths here
    return validRoutePatterns.some((pattern) => {
      const regexPattern = pattern.replace(/\*/g, ".*");
      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(route);
    });
  };

  const resetAgentSettings = useCallback(() => {
    setMode("normal");
    setAgentType("na");
  }, []);

  // Update path when component mounts and window is available
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);

      // Listen for path changes
      const handleRouteChange = () => {
        setCurrentPath(window.location.pathname);
      };

      window.addEventListener("popstate", handleRouteChange);
      return () => window.removeEventListener("popstate", handleRouteChange);
    }
  }, []);

  // Refs for functions to break circular dependencies
  const showApiKeyModalRef =
    useRef<
      (actionType: "message" | "modelResponse", actionData: any) => void
    >();
  const currentChatRef = useRef<Chat | null>(null);
  const currentFolderRef = useRef<string | null>(null);

  // Keep currentChatRef in sync with activeChat (USED FOR NEW CHAT)
  useEffect(() => {
    currentChatRef.current = activeChat;
  }, [activeChat]);

  // Initialize state from localStorage
  useEffect(() => {
    const initializeApp = async () => {
      if (typeof window !== "undefined") {
        try {
          const savedChats = safeLocalStorage.getItem("PC_chats");
          const savedActiveChat = safeLocalStorage.getItem("PC_activeChat");
          const savedDarkMode = safeLocalStorage.getItem("PC_darkMode");

          let parsedChats: Chat[] = [];
          let parsedActiveChat: Chat | null = null;

          if (savedChats) {
            parsedChats = JSON.parse(savedChats);
            setChats(parsedChats);
          }

          if (savedActiveChat) {
            parsedActiveChat = JSON.parse(savedActiveChat);
            // Ensure active chat exists in the chats list
            const chatExists = parsedChats.some(
              (chat) => chat.id === parsedActiveChat?.id,
            );
            if (chatExists) {
              setActiveChat(parsedActiveChat);
              setMode(String(parsedActiveChat?.messages[0].mode));
              setAgentType(String(parsedActiveChat?.messages[0].agentType));
              currentChatRef.current = parsedActiveChat;
            } else {
              safeLocalStorage.removeItem("activeChat");
            }
          }

          if (savedDarkMode) {
            setIsDarkMode(JSON.parse(savedDarkMode));
          }
        } catch (error) {
          console.error("Error loading data from localStorage:", error);
          // Clear potentially corrupted data
          safeLocalStorage.removeItem("chats");
          safeLocalStorage.removeItem("activeChat");
        }
      }
      setMounted(true);
      // Add a small delay to ensure smooth transition
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    };

    initializeApp();
  }, []);

  // Persist active chat whenever it changes
  useEffect(() => {
    if (mounted && activeChat) {
      safeLocalStorage.setItem("PC_activeChat", JSON.stringify(activeChat));
      setMode(activeChat.messages[0].mode);
      setAgentType(activeChat.messages[0].agentType);
      setSelectedModel(String(activeChat.model));
    }
  }, [activeChat, mounted]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const generateSmartTitle = (userMessage: string): string => {
    // Clean the message while preserving mathematical operators and numbers
    const cleanMessage = userMessage
      .replace(/[^a-zA-Z0-9=+\-*/.\s?!,()]/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

    const generateTitle = () => {
      const message = cleanMessage;

      // Remove common greetings from the start
      const messageWithoutGreeting = message
        .replace(
          /^(?:hi|hello|hey|greetings|good morning|good afternoon|good evening)(?:\s*there)?[!,.]?\s*/i,
          "",
        )
        .trim();

      // If only greeting remains
      if (
        !messageWithoutGreeting ||
        /^[!,.\s]*$/.test(messageWithoutGreeting)
      ) {
        return "New Conversation";
      }

      // Mathematical expressions first
      const mathPatterns = [
        {
          regex:
            /^(?:what is |calculate |solve )?(\(?\s*[\d.]+\s*[+\-*/]\s*[\d.]+\s*\)?)/i,
          transform: (match: string[]) => `Calculate ${match[1]}`,
        },
        {
          regex: /^(?:what is |calculate )?(\d*\.?\d+\s*\/\s*\d*\.?\d+)$/i,
          transform: (match: string[]) => `Calculate ${match[1]}`,
        },
        {
          regex:
            /^(?:what is |calculate )?(\d*\.?\d+%\s*(?:of|from|to)\s*\d*\.?\d+)/i,
          transform: (match: string[]) => `Calculate Percentage: ${match[1]}`,
        },
        {
          regex: /^(?:what is |calculate )?(\d+(?:\s*[+\-*/]\s*\d+)+)$/i,
          transform: (match: string[]) => `Calculate ${match[1]}`,
        },
      ];

      // Try math patterns first with original message
      for (const pattern of mathPatterns) {
        const match = message.match(pattern.regex);
        if (match) {
          return pattern.transform(match);
        }
      }

      // Other patterns - use messageWithoutGreeting
      const patterns = [
        {
          // Questions starting with "Can you tell/show/explain"
          regex:
            /^(?:can|could) (?:you )?(?:tell|show|explain|help)(?: me)?(?: (?:what|how|why|where|when|about))?(?: is| are)? (.{3,100}?)(?:\?|$)/i,
          transform: (match: string[]) => match[1].trim(),
        },
        {
          // What/How/Why questions
          regex:
            /^(?:what|how|why|where|when) (?:is|are|does|do|can|would|should|will|to|about|if) (.{3,100}?)(?:\?|$)/i,
          transform: (match: string[]) => match[1].trim(),
        },
        {
          // Direct questions or statements
          regex:
            /^(?:please |kindly )?(?:i want to |i need to |i'd like to |help me |show me how to )?(.{3,100}?)(?:\?|$)/i,
          transform: (match: string[]) => match[1].trim(),
        },
        {
          // Comparison questions
          regex:
            /^(?:what is |what's |show |tell me )?(?:the )?difference between (.{3,100}?)(?:\?|$)/i,
          transform: (match: string[]) => `Comparing ${match[1]}`,
        },
        {
          // Definition requests
          regex:
            /^(?:what is |what's |define |explain )?(?:the )?(?:meaning|definition) of (.{3,100}?)(?:\?|$)/i,
          transform: (match: string[]) => match[1].trim(),
        },
      ];

      // Try patterns with messageWithoutGreeting
      for (const pattern of patterns) {
        const match = messageWithoutGreeting.match(pattern.regex);
        if (match) {
          const title = pattern.transform(match);
          return title.charAt(0).toUpperCase() + title.slice(1);
        }
      }

      // Default title generation - take meaningful portion of the messageWithoutGreeting
      const words = messageWithoutGreeting.split(" ");
      let meaningfulTitle = "";

      if (words.length <= 8) {
        meaningfulTitle = messageWithoutGreeting;
      } else {
        // Try to find a natural break point (punctuation or conjunction)
        const breakPoints = messageWithoutGreeting.match(
          /[,.!?;]|\s(?:and|or|but|because)\s/i,
        );
        if (breakPoints && breakPoints.index && breakPoints.index < 100) {
          meaningfulTitle = messageWithoutGreeting.slice(0, breakPoints.index);
        } else {
          // Take first 8 words if no good break point found
          meaningfulTitle = words.slice(0, 8).join(" ") + "...";
        }
      }

      return meaningfulTitle.charAt(0).toUpperCase() + meaningfulTitle.slice(1);
    };

    return generateTitle();
  };

  const startNewChat = useCallback(
    async (folderId?: string) => {
      if (!mounted) {
        console.error("Not mounted");
        return;
      }

      try {
        setActiveChat(null);
        resetAgentSettings();
        // Store folderId in ref to use when first message is added
        if (folderId) {
          currentFolderRef.current = folderId;
        } else {
          currentFolderRef.current = null;
        }
        document.title = "PromptCue";
        await featureUsageLogger({
          featureName: "chat_management",
          eventType: "new_chat_started",
          eventMetadata: {
            timestamp: new Date().toISOString(),
            folderId,
          },
        });
      } catch (error) {
        logError("chat_management", "new_chat", error, {
          component: "AppContext",
          metadata: { model: localStorage.getItem("PC_selectedModel") },
        });
        message.error("Failed to create new chat. Please try again.", 3);
      }
    },
    [mounted],
  );

  const handleTemporaryModeToggle = useCallback(
    async (value: boolean) => {
      try {
        if (value) {
          // Starting temporary chat
          startNewChat();
          setIsTemporaryMode(true);
          setTemporaryMessages([]);

          await featureUsageLogger({
            featureName: "chat_settings",
            eventType: "temporary_mode_toggled",
            eventMetadata: {
              enabled: true,
            },
          });
        } else {
          // Ending temporary chat
          setIsTemporaryMode(false);
          setTemporaryMessages([]);
          startNewChat();

          await featureUsageLogger({
            featureName: "chat_settings",
            eventType: "temporary_mode_toggled",
            eventMetadata: {
              enabled: false,
            },
          });
        }
      } catch (error) {
        console.error("Error toggling temporary mode:", error);
      }
    },
    [startNewChat],
  );

  // Define addMessage with ref to showApiKeyModal
  const addMessage = useCallback(
    (
      messageData: Pick<
        Message,
        | "content"
        | "role"
        | "responseTime"
        | "responseTokens"
        | "status"
        | "mode"
        | "agentType"
      >,
    ) => {
      try {
        const storedKeys = JSON.parse(
          safeLocalStorage.getItem("PC_modelApiKeys", "{}"),
        );
        const modelApiKey = storedKeys[selectedModel];

        if (!modelApiKey && showApiKeyModalRef.current) {
          showApiKeyModalRef.current("message", messageData);
          return null;
        }

        const newMessage: Message = {
          id: uuidv4(),
          content: messageData.content,
          role: messageData.role,
          timestamp: new Date().toISOString(),
          model: selectedModel,
          status: messageData.status,
          responseTime: messageData.responseTime,
          responseTokens: messageData.responseTokens,
          mode: messageData.mode,
          agentType: messageData.agentType,
        };

        let updatedChat: Chat;
        let updatedChats: Chat[];

        const currentChat = currentChatRef.current;

        if (!currentChat) {
          // Create new chat with user's message as title
          const chatTitle =
            messageData.role === "user"
              ? generateSmartTitle(messageData.content)
              : "New Chat";

          updatedChat = {
            id: uuidv4(),
            title: chatTitle,
            messages: [newMessage],
            model: selectedModel,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          updatedChats = [...chats, updatedChat];

          // If there's a pending folder ID, add the chat to that folder
          const folderId = currentFolderRef.current;
          if (folderId) {
            addChatToFolder(folderId, updatedChat.id);
            // Clear the folder ref
            currentFolderRef.current = null;
          }
        } else {
          // Update existing chat
          updatedChat = {
            ...currentChat,
            messages: [...currentChat.messages, newMessage],
            updatedAt: new Date().toISOString(),
          };
          updatedChats = chats.map((chat) =>
            chat.id === currentChat.id ? updatedChat : chat,
          );
          if (!updatedChats.some((chat) => chat.id === currentChat.id)) {
            updatedChats = [...updatedChats, updatedChat];
          }
        }

        // First update the state
        setChats(updatedChats);
        setActiveChat(updatedChat);
        currentChatRef.current = updatedChat;

        // Then persist to localStorage
        try {
          safeLocalStorage.setItem("PC_chats", JSON.stringify(updatedChats));
          safeLocalStorage.setItem(
            "PC_activeChat",
            JSON.stringify(updatedChat),
          );
        } catch (error) {
          console.error("Error saving to localStorage:", error);
        }

        logInfo("chat", "message_added", {
          component: "AppContext",
          metadata: {
            chatId: updatedChat.id,
            messageId: newMessage.id,
            model: selectedModel,
            folderId: currentFolderRef.current,
          },
        });
        return updatedChat;
      } catch (error) {
        console.error("Error in addMessage:", error);
        throw error;
      }
    },
    [activeChat, selectedModel, chats],
  );

  // Persist chats whenever they change
  useEffect(() => {
    if (mounted && chats.length > 0) {
      safeLocalStorage.setItem("PC_chats", JSON.stringify(chats));
    }
  }, [chats, mounted]);

  // Utility functions
  const deleteChat = useCallback(
    async (chatId: string) => {
      featureUsageLogger({
        featureName: "chat_management",
        eventType: "delete_chat_started",
        eventMetadata: {
          chatId,
          timestamp: new Date().toISOString(),
        },
      });

      // Remove chat from any folders it belongs to
      setProjectFolders((prevFolders) => {
        const updatedFolders = prevFolders.map((folder) => ({
          ...folder,
          chatIds: folder.chatIds.filter((id) => id !== chatId),
        }));
        safeLocalStorage.setItem(
          "PC_projectFolders",
          JSON.stringify(updatedFolders),
        );
        return updatedFolders;
      });

      setChats((prevChats) => {
        const newChats = prevChats.filter((chat) => chat.id !== chatId);
        safeLocalStorage.setItem("PC_chats", JSON.stringify(newChats));
        logInfo("chat", "chat_deleted", {
          component: "AppContext",
          metadata: { chatId },
        });
        return newChats;
      });

      if (activeChat?.id === chatId) {
        setActiveChat(null);
        safeLocalStorage.removeItem("activeChat");
      }
    },
    [activeChat],
  );

  const getModelApiKey = useCallback((model: string) => {
    try {
      const keys = JSON.parse(
        safeLocalStorage.getItem("PC_modelApiKeys") || "{}",
      );
      return keys[model] || null;
    } catch {
      return null;
    }
  }, []);

  const setModelApiKey = useCallback(async (model: string, key: string) => {
    try {
      const isValid = await validateModelApiKey(model, key);
      if (!isValid) return false;

      const keys = JSON.parse(
        safeLocalStorage.getItem("PC_modelApiKeys") || "{}",
      );
      keys[model] = key;
      safeLocalStorage.setItem("PC_modelApiKeys", JSON.stringify(keys));
      logInfo("model", "api_key_set", {
        component: "AppContext",
        metadata: { model, key },
      });
      return true;
    } catch (error) {
      console.error("Error in setModelApiKey:", error);
      return false;
    }
  }, []);

  // Persist state changes
  useEffect(() => {
    if (mounted) {
      safeLocalStorage.setItem("PC_darkMode", JSON.stringify(isDarkMode));
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [isDarkMode, mounted]);

  // Computed property for archived chats
  const archivedChats = useMemo(() => {
    return chats.filter((chat) => chat.isArchived);
  }, [chats]);

  // Archive a chat
  const archiveChat = useCallback(
    (id: string) => {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === id
            ? { ...chat, isArchived: true, updatedAt: new Date().toISOString() }
            : chat,
        ),
      );
      message.success("Chat archived successfully");
      // If the archived chat is active, clear it
      if (activeChat?.id === id) {
        setActiveChat(null);
      }
    },
    [activeChat],
  );

  // Restore a chat from archive
  const restoreChat = useCallback(async (id: string) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === id ? { ...chat, isArchived: false } : chat,
      ),
    );
    await featureUsageLogger({
      featureName: "chat_management",
      eventType: "restore_chat",
      eventMetadata: {
        chatId: id,
        timestamp: new Date().toISOString(),
      },
    });
  }, []);

  const exportChat = useCallback(
    async (chatId: string) => {
      try {
        await featureUsageLogger({
          featureName: "chat_management",
          eventType: "export_chat_started",
          eventMetadata: {
            chatId,
            timestamp: new Date().toISOString(),
          },
        });
        const chatToExport = chats.find((chat) => chat.id === chatId);
        if (!chatToExport) {
          message.error("Chat not found");
          return;
        }

        if (chatToExport.messages.length === 0) {
          message.warning("No messages to export");
          return;
        }

        // Determine participants based on chat's mode and agentType
        const participants = ["User", chatToExport.model || "AI Agent"];
        const chatMode = chatToExport.messages[0]?.mode;
        const chatAgentType = chatToExport.messages[0]?.agentType;

        if (chatMode === "agent" && chatAgentType) {
          participants.push(chatAgentType === "research" ? "Scott" : "Jordan");
        }

        const exportData = {
          chatId: chatToExport.id,
          title: chatToExport.title,
          participants,
          messages: chatToExport.messages.map((msg) => ({
            sender: msg.role === "user" ? "User" : "AI",
            timestamp: msg.timestamp,
            content: msg.content,
            metadata: {
              model: msg.model,
              mode: msg.mode,
              agentType: msg.agentType,
              responseTime: msg.responseTime,
            },
          })),
          exportedAt: new Date().toISOString(),
        };

        // Create Blob and download
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: "application/json",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        const sanitizedTitle = chatToExport.title
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase();
        const fileName = `PromptCue_Chat_${sanitizedTitle}_${chatToExport.id}_${new Date().toISOString().split("T")[0]}.json`;

        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        message.success("Chat exported successfully");

        await featureUsageLogger({
          featureName: "chat_settings",
          eventType: "export_chat_finished",
          eventMetadata: {
            chatId,
            fileName,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error("Error exporting chat:", error);
        message.error("Failed to export chat. Please try again.");
      }
    },
    [chats],
  );

  // Pin-related functions
  const togglePinChat = useCallback((chatId: string) => {
    setChats((prevChats) => {
      const updatedChats = prevChats.map((chat) => {
        if (chat.id === chatId) {
          featureUsageLogger({
            featureName: "chat_settings",
            eventType: "pinned_chat_toggle",
            eventMetadata: {
              chatId,
              pinned: chat.isPinned,
            },
          });
          return {
            ...chat,
            isPinned: !chat.isPinned,
            pinnedAt: !chat.isPinned ? Date.now() : undefined,
          };
        }
        return chat;
      });

      // Save to localStorage
      try {
        const savedChats = localStorage.getItem("PC_chats");
        const chatsData = savedChats ? JSON.parse(savedChats) : {};
        chatsData.chats = updatedChats;
        localStorage.setItem("PC_chats", JSON.stringify(chatsData));
      } catch (error) {
        console.error("Error saving pinned status:", error);
      }

      return updatedChats;
    });
  }, []);

  const getPinnedChats = useCallback(() => {
    return chats
      .filter((chat) => chat.isPinned)
      .sort((a, b) => (b.pinnedAt || 0) - (a.pinnedAt || 0));
  }, [chats]);

  const getUnpinnedChats = useCallback(() => {
    return chats
      .filter((chat) => !chat.isPinned)
      .sort((a, b) => {
        const aLastMessage = a.messages[a.messages.length - 1];
        const bLastMessage = b.messages[b.messages.length - 1];
        const aTime = aLastMessage
          ? new Date(aLastMessage.timestamp).getTime()
          : 0;
        const bTime = bLastMessage
          ? new Date(bLastMessage.timestamp).getTime()
          : 0;
        return bTime - aTime;
      });
  }, [chats]);

  // Delete message function for regular chats
  const deleteMessage = useCallback(
    async (messageId: string) => {
      try {
        if (!activeChat) return;

        // Create updated messages array without the deleted message
        const updatedMessages = activeChat.messages.filter(
          (msg) => msg.id !== messageId,
        );

        // If this was the last message, delete the entire chat
        if (updatedMessages.length === 0) {
          const updatedChats = chats.filter(
            (chat) => chat.id !== activeChat.id,
          );
          setChats(updatedChats);
          setActiveChat(null);
          safeLocalStorage.setItem("PC_chats", JSON.stringify(updatedChats));
          safeLocalStorage.removeItem("PC_activeChat");
          message.success("Chat deleted successfully", 1);
          return;
        }

        // Update the chat with new messages
        const updatedChat = {
          ...activeChat,
          messages: updatedMessages,
          updatedAt: new Date().toISOString(),
        };

        // Update chats array
        const updatedChats = chats.map((chat) =>
          chat.id === activeChat.id ? updatedChat : chat,
        );

        // Update state and localStorage
        setActiveChat(updatedChat);
        setChats(updatedChats);
        safeLocalStorage.setItem("PC_chats", JSON.stringify(updatedChats));
        safeLocalStorage.setItem("PC_activeChat", JSON.stringify(updatedChat));

        await featureUsageLogger({
          featureName: "chat_management",
          eventType: "delete_message",
          eventMetadata: {
            chatId: activeChat.id,
            messageId,
            timestamp: new Date().toISOString(),
          },
        });

        message.success("Message deleted successfully", 1);
      } catch (error) {
        logError("chat_management", "delete_message", error, {
          component: "AppContext",
          metadata: { messageId },
        });
        message.error("Failed to delete message. Please try again.", 1);
      }
    },
    [activeChat, chats, message],
  );

  // Delete message function for temporary chats
  const deleteTemporaryMessage = useCallback(
    (index: number) => {
      try {
        const updatedMessages = [...temporaryMessages];
        updatedMessages.splice(index, 1);

        // If this was the last message, clear all temporary messages
        if (updatedMessages.length === 0) {
          setTemporaryMessages([]);
          message.success("All temporary messages cleared");
          return;
        }

        setTemporaryMessages(updatedMessages);
        message.success("Temporary message deleted successfully");
      } catch (error) {
        logError("chat_management", "delete_temporary_message", error, {
          component: "AppContext",
          metadata: { index },
        });
        message.error("Failed to delete temporary message. Please try again.");
      }
    },
    [temporaryMessages, message],
  );

  // Delete messages after a specific index (including the index) and trigger regeneration
  const deleteMessagesAfterIndex = useCallback(
    async (messageId: string) => {
      try {
        if (!activeChat) return { isSingleMessage: false };

        // Find the message to regenerate
        const messageIndex = activeChat.messages.findIndex(
          (msg) => msg.id === messageId,
        );
        if (messageIndex === -1) return { isSingleMessage: false };

        // Find the last user message before this AI response
        const lastUserMessageIndex =
          activeChat.messages
            .slice(0, messageIndex)
            .map((msg, idx) => ({ msg, idx }))
            .filter(({ msg }) => msg.role === "user")
            .pop()?.idx ?? -1;

        // Check if this is the only user message
        const isSingleMessage =
          lastUserMessageIndex === -1 || lastUserMessageIndex === 0;

        const updatedMessages = isSingleMessage
          ? [activeChat.messages[0]] // Always keep the first message
          : activeChat.messages.slice(0, lastUserMessageIndex); // Keep messages up to and including last user message

        // Update the chat with new messages
        const updatedChat = {
          ...activeChat,
          messages: updatedMessages,
          updatedAt: new Date().toISOString(),
        };

        // Update chats array
        const updatedChats = chats.map((chat) =>
          chat.id === activeChat.id ? updatedChat : chat,
        );

        // Update state and localStorage
        setActiveChat(updatedChat);
        setChats(updatedChats);
        safeLocalStorage.setItem("PC_chats", JSON.stringify(updatedChats));
        safeLocalStorage.setItem("PC_activeChat", JSON.stringify(updatedChat));

        featureUsageLogger({
          featureName: "chat_management",
          eventType: "regenerate_message",
          eventMetadata: {
            chatId: activeChat.id,
            messageId,
            isSingleMessage,
            timestamp: new Date().toISOString(),
          },
        });

        return { isSingleMessage };
      } catch (error) {
        logError("chat_management", "regenerate_message", error, {
          component: "AppContext",
          metadata: { messageId },
        });
        message.error("Failed to regenerate message. Please try again.");
        return { isSingleMessage: false };
      }
    },
    [activeChat, chats, message],
  );

  // Delete temporary messages after a specific index (including the index)
  const deleteTemporaryMessagesAfterIndex = async (index: number) => {
    // Check if the index is valid
    if (index < 0 || index >= temporaryMessages.length) {
      return { isSingleMessage: false };
    }

    // Find the last user message before this index
    const lastUserMessageIndex =
      temporaryMessages
        .slice(0, index)
        .map((msg, idx) => ({ msg, idx }))
        .filter(({ msg }) => msg.role === "user")
        .pop()?.idx ?? -1;

    // Check if there are user messages
    const userMessages = temporaryMessages
      .slice(0, index)
      .filter((msg) => msg.role === "user");
    const isSingleMessage = userMessages.length === 1;

    // Create updated messages array, preserving all user messages if there are multiple
    const updatedMessages = isSingleMessage
      ? [temporaryMessages[0]] // Keep the user message
      : temporaryMessages.slice(0, lastUserMessageIndex); // Keep all messages up to and including the last user message

    setTemporaryMessages(updatedMessages);
    return { isSingleMessage };
  };

  // Project Folder Management
  const createProjectFolder = useCallback((name: string) => {
    const newFolder: ProjectFolder = {
      id: uuidv4(),
      name,
      chatIds: [],
      createdAt: new Date().toISOString(),
      isExpanded: true,
    };
    setProjectFolders((prev) => [newFolder, ...prev]);
    featureUsageLogger({
      featureName: "chat_management",
      eventType: "create_folder",
      eventMetadata: {
        folderId: newFolder.id,
        timestamp: new Date().toISOString(),
      },
    });
  }, []);

  const deleteProjectFolder = useCallback(
    (id: string, deleteChats: boolean = false) => {
      setProjectFolders((prev) => {
        const folder = prev.find((f) => f.id === id);
        if (!folder) return prev;

        if (deleteChats) {
          // Delete both folder and its chats
          setChats((prevChats) =>
            prevChats.filter((chat) => !folder.chatIds.includes(chat.id)),
          );
        }

        return prev.filter((f) => f.id !== id);
      });
    },
    [setChats],
  );

  const renameProjectFolder = useCallback((id: string, newName: string) => {
    setProjectFolders((prev) =>
      prev.map((folder) =>
        folder.id === id ? { ...folder, name: newName } : folder,
      ),
    );
  }, []);

  const addChatToFolder = useCallback((folderId: string, chatId: string) => {
    setProjectFolders((prev) => {
      // First, remove the chat from any folder it's currently in
      const foldersWithoutChat = prev.map((folder) => ({
        ...folder,
        chatIds: folder.chatIds.filter((id) => id !== chatId),
      }));

      // Then, add it to the target folder
      return foldersWithoutChat.map((folder) => {
        if (folder.id === folderId) {
          return { ...folder, chatIds: [...folder.chatIds, chatId] };
        }
        return folder;
      });
    });
  }, []);

  const removeChatFromFolder = useCallback(
    (folderId: string, chatId: string) => {
      setProjectFolders((prev) =>
        prev.map((folder) =>
          folder.id === folderId
            ? {
                ...folder,
                chatIds: folder.chatIds.filter((id) => id !== chatId),
              }
            : folder,
        ),
      );
    },
    [],
  );

  const toggleFolderExpansion = useCallback((folderId: string) => {
    setProjectFolders((prev) =>
      prev.map((folder) =>
        folder.id === folderId
          ? { ...folder, isExpanded: !folder.isExpanded }
          : folder,
      ),
    );
  }, []);

  const getFolderForChat = useCallback(
    (chatId: string) => {
      return (
        projectFolders.find((folder) => folder.chatIds.includes(chatId)) || null
      );
    },
    [projectFolders],
  );

  // Save folders to localStorage whenever they change
  useEffect(() => {
    safeLocalStorage.setItem(
      "PC_projectFolders",
      JSON.stringify(projectFolders),
    );
  }, [projectFolders]);

  const contextValue = useMemo(
    () => ({
      isDarkMode,
      setIsDarkMode,
      toggleDarkMode,
      chats,
      setChats,
      activeChat,
      setActiveChat,
      startNewChat,
      addMessage,
      deleteMessage,
      deleteTemporaryMessage,
      deleteChat,
      selectedModel,
      setSelectedModel,
      apiKeys,
      setApiKeys,
      getModelApiKey,
      setModelApiKey,
      mode,
      agentType,
      setMode,
      setAgentType,
      resetAgentSettings,
      isTemporaryMode,
      setTemporaryMode: handleTemporaryModeToggle,
      temporaryMessages,
      setTemporaryMessages,
      archiveChat,
      restoreChat,
      archivedChats,
      exportChat,
      togglePinChat,
      getPinnedChats,
      getUnpinnedChats,
      deleteMessagesAfterIndex,
      deleteTemporaryMessagesAfterIndex,
      projectFolders,
      createProjectFolder,
      deleteProjectFolder,
      renameProjectFolder,
      addChatToFolder,
      removeChatFromFolder,
      toggleFolderExpansion,
      getFolderForChat,
    }),
    [
      isDarkMode,
      setIsDarkMode,
      toggleDarkMode,
      chats,
      setChats,
      activeChat,
      setActiveChat,
      startNewChat,
      addMessage,
      deleteMessage,
      deleteTemporaryMessage,
      deleteChat,
      selectedModel,
      setSelectedModel,
      apiKeys,
      setApiKeys,
      getModelApiKey,
      setModelApiKey,
      mode,
      agentType,
      setMode,
      setAgentType,
      resetAgentSettings,
      isTemporaryMode,
      handleTemporaryModeToggle,
      temporaryMessages,
      setTemporaryMessages,
      archiveChat,
      restoreChat,
      archivedChats,
      exportChat,
      togglePinChat,
      getPinnedChats,
      getUnpinnedChats,
      deleteMessagesAfterIndex,
      deleteTemporaryMessagesAfterIndex,
      projectFolders,
      createProjectFolder,
      deleteProjectFolder,
      renameProjectFolder,
      addChatToFolder,
      removeChatFromFolder,
      toggleFolderExpansion,
      getFolderForChat,
    ],
  );

  return (
    <AppContext.Provider value={contextValue}>
      {isLoading ? (
        <LoadingScreen />
      ) : mounted && !isValidRoute(currentPath) ? (
        <NotFound />
      ) : (
        children
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

export type { Chat, Message, ProjectFolder };
export default AppContext;
