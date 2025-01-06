import { Question } from "./question";

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  questions?: Question[];
}
