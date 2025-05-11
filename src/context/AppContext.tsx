"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { validateModelApiKey } from "../config/modelConfig";
import LoadingScreen from "../components/LoadingScreen/LoadingScreen";
import NotFound from "../components/AppStatus/PageNotFound/NotFound";
import { logInfo } from "../utils/logger";

interface Message {
  responseTime: number;
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  timestamp: string;
  status?: "pending" | "completed" | "error";
  model?: string;
}

interface Chat {
  id: string;
  messages: Message[];
  model: string;
  createdAt: string;
  updatedAt: string;
  title: string;
}

interface AppContextType {
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  toggleDarkMode: () => void;
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  activeChat: Chat | null;
  setActiveChat: React.Dispatch<React.SetStateAction<Chat | null>>;
  pendingMessage: Omit<Message, "id" | "timestamp"> | null;
  setPendingMessage: React.Dispatch<
    React.SetStateAction<Omit<Message, "id" | "timestamp"> | null>
  >;
  startNewChat: () => void;
  addMessage: (messageData: Pick<Message, "content" | "role">) => Chat | null;
  deleteChat: (chatId: string) => void;
  selectedModel: string;
  setSelectedModel: React.Dispatch<React.SetStateAction<string>>;
  apiKeys: Record<string, string>;
  setApiKeys: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  getModelApiKey: (model: string) => string | null;
  setModelApiKey: (model: string, key: string) => Promise<boolean>;
  updateMessageStatus: (
    messageId: string,
    status: "pending" | "completed" | "error",
  ) => void;
  clearPendingMessages: () => void;
  isApiKeyModalVisible: boolean;
  setIsApiKeyModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  handleApiKeyValidated: () => Promise<void>;
  showApiKeyModalForModel: (
    actionType: "message" | "modelResponse",
    actionData: any,
  ) => void;
}

const AppContext = createContext<AppContextType>({
  isDarkMode: false,
  setIsDarkMode: () => {},
  toggleDarkMode: () => {},
  chats: [],
  setChats: () => {},
  activeChat: null,
  setActiveChat: () => {},
  pendingMessage: null,
  setPendingMessage: () => {},
  startNewChat: () => {},
  addMessage: () => {
    throw new Error("Not implemented");
  },
  deleteChat: () => {},
  selectedModel: "gpt-3.5-turbo",
  setSelectedModel: () => {},
  apiKeys: {},
  setApiKeys: () => {},
  getModelApiKey: () => null,
  setModelApiKey: async () => false,
  updateMessageStatus: () => {},
  clearPendingMessages: () => {},
  isApiKeyModalVisible: false,
  setIsApiKeyModalVisible: () => {},
  handleApiKeyValidated: async () => {},
  showApiKeyModalForModel: () => {},
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
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo");
  const [pendingMessage, setPendingMessage] = useState<Omit<
    Message,
    "id" | "timestamp"
  > | null>(null);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [isApiKeyModalVisible, setIsApiKeyModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: "message" | "modelResponse";
    data: any;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState<string>("/");

  // Check if the current path exists in your app's routes
  const isValidRoute = (route: string) => {
    // Add all valid routes here
    const validRoutePatterns = ["/", "/chat", "/settings", "/info/*"]; // Add wildcard paths here
    return validRoutePatterns.some((pattern) => {
      const regexPattern = pattern.replace(/\*/g, ".*");
      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(route);
    });
  };

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
  const addMessageRef =
    useRef<(messageData: Pick<Message, "content" | "role">) => Chat | null>();
  const sendMessageToModelRef =
    useRef<(prompt: string) => Promise<Chat | null>>();
  const showApiKeyModalRef =
    useRef<
      (actionType: "message" | "modelResponse", actionData: any) => void
    >();
  const currentChatRef = useRef<Chat | null>(null);

  // Keep currentChatRef in sync with activeChat
  useEffect(() => {
    currentChatRef.current = activeChat;
  }, [activeChat]);

  // Basic functions without dependencies
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const startNewChat = useCallback(() => {
    if (!mounted) {
      console.error("Not mounted");
      return;
    }
    setActiveChat(null);
    localStorage.setItem("selectedModel", "");
    document.title = "PromptCue";
  }, [mounted]);

  // Define showApiKeyModalForModel first
  const showApiKeyModalForModel = useCallback(
    (actionType: "message" | "modelResponse", actionData: any) => {
      setIsApiKeyModalVisible(true);
      setPendingAction({ type: actionType, data: actionData });
    },
    [],
  );

  // Update ref immediately
  useEffect(() => {
    showApiKeyModalRef.current = showApiKeyModalForModel;
  }, [showApiKeyModalForModel]);

  // Define addMessage with ref to showApiKeyModal
  const addMessage = useCallback(
    (
      messageData: Pick<
        Message,
        "content" | "role" | "responseTime" | "status"
      >,
    ) => {
      try {
        const storedKeys = JSON.parse(
          safeLocalStorage.getItem("modelApiKeys", "{}"),
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
        };

        let updatedChat: Chat;
        let updatedChats: Chat[];

        const currentChat = currentChatRef.current;

        if (!currentChat) {
          // Create new chat with user's message as title
          const chatTitle =
            messageData.role === "user"
              ? messageData.content.length > 30
                ? messageData.content.slice(0, 30) + "..."
                : messageData.content
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
        } else {
          // Update existing chat
          updatedChat = {
            ...currentChat,
            messages: [...currentChat.messages, newMessage],
            updatedAt: new Date().toISOString(),
          };
          // Find and update the chat in the list, preserving order
          updatedChats = chats.map((chat) =>
            chat.id === currentChat.id ? updatedChat : chat,
          );
          if (!updatedChats.some((chat) => chat.id === currentChat.id)) {
            // If chat wasn't found in the list, add it
            updatedChats = [...updatedChats, updatedChat];
          }
        }

        // First update the state
        setChats(updatedChats);
        setActiveChat(updatedChat);
        currentChatRef.current = updatedChat;

        // Then persist to localStorage
        try {
          safeLocalStorage.setItem("chats", JSON.stringify(updatedChats));
          safeLocalStorage.setItem("activeChat", JSON.stringify(updatedChat));
        } catch (error) {
          console.error("Error saving to localStorage:", error);
        }
        logInfo("chat", "message_added", {
          component: "AppContext",
          metadata: {
            chatId: updatedChat.id,
            messageId: newMessage.id,
            model: selectedModel,
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
      safeLocalStorage.setItem("chats", JSON.stringify(chats));
    }
  }, [chats, mounted]);

  // Persist active chat whenever it changes
  useEffect(() => {
    if (mounted && activeChat) {
      safeLocalStorage.setItem("activeChat", JSON.stringify(activeChat));
    }
  }, [activeChat, mounted]);

  // Utility functions
  const deleteChat = useCallback(
    (chatId: string) => {
      setChats((prevChats) => {
        const newChats = prevChats.filter((chat) => chat.id !== chatId);
        safeLocalStorage.setItem("chats", JSON.stringify(newChats));
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
      console.groupEnd();
    },
    [activeChat],
  );

  const getModelApiKey = useCallback((model: string) => {
    try {
      const keys = JSON.parse(safeLocalStorage.getItem("modelApiKeys") || "{}");
      return keys[model] || null;
    } catch {
      return null;
    }
  }, []);

  const setModelApiKey = useCallback(async (model: string, key: string) => {
    try {
      const isValid = await validateModelApiKey(model, key);
      if (!isValid) return false;

      const keys = JSON.parse(safeLocalStorage.getItem("modelApiKeys") || "{}");
      keys[model] = key;
      safeLocalStorage.setItem("modelApiKeys", JSON.stringify(keys));
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

  const updateMessageStatus = useCallback(
    (messageId: string, status: "pending" | "completed" | "error") => {
      setChats((prevChats) =>
        prevChats.map((chat) => ({
          ...chat,
          messages: chat.messages.map((msg) =>
            msg.id === messageId ? { ...msg, status } : msg,
          ),
        })),
      );

      setActiveChat((prevActiveChat) => {
        if (!prevActiveChat) return null;
        return {
          ...prevActiveChat,
          messages: prevActiveChat.messages.map((msg) =>
            msg.id === messageId ? { ...msg, status } : msg,
          ),
        };
      });
      logInfo("chat", "message_status_updated", {
        component: "AppContext",
        metadata: { messageId, status },
      });
    },
    [],
  );

  const clearPendingMessages = useCallback(() => {
    setChats((prevChats) =>
      prevChats.map((chat) => ({
        ...chat,
        messages: chat.messages.filter((msg) => msg.status !== "pending"),
      })),
    );

    setActiveChat((prevActiveChat) => {
      if (!prevActiveChat) return null;
      return {
        ...prevActiveChat,
        messages: prevActiveChat.messages.filter(
          (msg) => msg.status !== "pending",
        ),
      };
    });
    logInfo("chat", "pending_messages_cleared", {
      component: "AppContext",
    });
  }, []);

  // Initialize state from localStorage
  useEffect(() => {
    const initializeApp = async () => {
      if (typeof window !== "undefined") {
        try {
          console.group("Initializing from localStorage");
          const savedChats = safeLocalStorage.getItem("chats");
          const savedActiveChat = safeLocalStorage.getItem("activeChat");
          const savedDarkMode = safeLocalStorage.getItem("darkMode");

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
              currentChatRef.current = parsedActiveChat;
            } else {
              safeLocalStorage.removeItem("activeChat");
            }
          }

          if (savedDarkMode) {
            setIsDarkMode(JSON.parse(savedDarkMode));
          }
          console.groupEnd();
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

  // Persist state changes
  useEffect(() => {
    if (mounted) {
      safeLocalStorage.setItem("darkMode", JSON.stringify(isDarkMode));
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [isDarkMode, mounted]);

  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      safeLocalStorage.setItem("chats", JSON.stringify(chats));
    }
  }, [chats, mounted]);

  useEffect(() => {
    if (activeChat?.messages[0]) {
      const defaultTitle =
        activeChat.messages[0].content.length > 30
          ? activeChat.messages[0].content.slice(0, 30) + "..."
          : activeChat.messages[0].content;
      document.title = `${defaultTitle} - PromptCue`;
    } else {
      document.title = "PromptCue";
    }
  }, [activeChat]);

  // Define handleApiKeyValidated with refs
  const handleApiKeyValidated = useCallback(async () => {
    if (!pendingAction) return;

    try {
      if (pendingAction.type === "message" && addMessageRef.current) {
        await addMessageRef.current(pendingAction.data);
      } else if (
        pendingAction.type === "modelResponse" &&
        sendMessageToModelRef.current
      ) {
        await sendMessageToModelRef.current(pendingAction.data);
      }
    } catch (error) {
      console.error("Error executing pending action:", error);
    } finally {
      setPendingAction(null);
      setIsApiKeyModalVisible(false);
    }
  }, [pendingAction]);

  // Context value
  const contextValue = {
    isDarkMode,
    setIsDarkMode,
    toggleDarkMode,
    chats,
    setChats,
    activeChat,
    setActiveChat,
    pendingMessage,
    setPendingMessage,
    startNewChat,
    addMessage,
    deleteChat,
    selectedModel,
    setSelectedModel,
    apiKeys,
    setApiKeys,
    getModelApiKey,
    setModelApiKey,
    updateMessageStatus,
    clearPendingMessages,
    isApiKeyModalVisible,
    setIsApiKeyModalVisible,
    handleApiKeyValidated,
    showApiKeyModalForModel,
  };

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

export type { Chat, Message };
export default AppContext;
