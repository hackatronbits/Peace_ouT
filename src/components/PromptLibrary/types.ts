export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  source?: string;
  isBuiltIn?: boolean;
  usageCount?: number;
  isPinned?: boolean;
}

export interface PromptLibraryProps {
  onViewChange?: (view: string) => void;
}

export interface PromptCardProps {
  prompt: Prompt;
  onEdit: (prompt: Prompt) => void;
  onDelete: (promptId: string) => void;
  onUseNow?: (prompt: Prompt) => void;
  onTogglePin?: (prompt: Prompt) => void;
}

export interface AddCustomPromptModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (prompt: Prompt) => void;
  promptToEdit?: Prompt;
}

export interface BuiltInPromptsModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (prompt: Prompt) => void;
}
