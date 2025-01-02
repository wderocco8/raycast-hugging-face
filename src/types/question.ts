export interface Question {
  id: string;
  conversationId: string;
  prompt: string;
  response: string;
  createdAt: string;
  isStreaming: boolean;
}

export interface QuestionsHook {
  data: Question[];
  isLoading: boolean;
  add: (question: Question) => Promise<void>;
  update: (question: Question) => Promise<void>;
  remove: (question: Question) => Promise<void>;
  removeByConversationId: (conversationId: string) => Promise<void>;
  getByConversation: (conversationId: string) => Question[];
}