export interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

export interface ConversationsHook {
  data: Conversation[];
  isLoading: boolean;
  add: (conversation: Conversation) => Promise<void>;
  update: (conversation: Conversation) => Promise<void>;
  remove: (conversation: Conversation) => Promise<void>;
  clear: () => Promise<void>;
}