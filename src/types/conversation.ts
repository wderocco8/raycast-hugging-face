import { Question } from "./question";

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  questions?: Question[];
}

export interface ConversationsHook {
  data: Conversation[];
  isLoading: boolean;
  add: (conversation: Conversation) => Promise<void>;
  update: (id: string, title: string) => Promise<void>;
  remove: (conversation: Conversation) => Promise<void>;
}
