export interface Question {
  id: string;
  conversation_id: string;
  prompt: string;
  response: string;
  created_at: string;
}
export interface QuestionsHook {
  data: Question[];
  isLoading: boolean;
  add: (question: Question) => Promise<void>;
  update: (question: Question) => Promise<void>;
  remove: (question: Question) => Promise<void>;
  getByConversation: (conversationId: string) => Question[];
}