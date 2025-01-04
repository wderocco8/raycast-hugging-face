/**
 * AskQuestionForm Component
 *
 * This file defines a...
 *
 */

import { Action, ActionPanel, Form, useNavigation } from "@raycast/api";
import { useState } from "react";
import { FormValidation, useForm } from "@raycast/utils";
import { v4 as uuidv4 } from "uuid";
import { Question } from "../../types/question";

interface AskQuestionFormValues {
  question: string;
}

interface AskQuestionFormProps {
  initialQuestion: string;
  conversationId: string;
  onQuestionSubmit: (question: Question) => Promise<void>;
}

export default function AskQuestionForm({ initialQuestion, conversationId, onQuestionSubmit }: AskQuestionFormProps) {
  const { pop } = useNavigation();
  const [loading, setLoading] = useState<boolean>(false);

  const { handleSubmit, itemProps } = useForm<AskQuestionFormValues>({
    onSubmit(values) {
      if (loading) return; // Prevent duplicate submissions
      handleGenerateResponse(values.question);
    },
    initialValues: {
      question: initialQuestion,
    },
    validation: {
      question: FormValidation.Required,
    },
  });

  const handleGenerateResponse = async (question: string) => {
    setLoading(true);
    try {
      const newQuestion = {
        id: uuidv4(),
        conversationId: conversationId,
        prompt: question,
        response: "",
        createdAt: new Date().toISOString(),
        isStreaming: true,
      };
      pop(); // Redirect back to Chat
      await onQuestionSubmit(newQuestion);
    } catch (error) {
      console.error("Error in handleGenerateResponse:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Chat" onSubmit={handleSubmit} />
        </ActionPanel>
      }
      isLoading={loading}
    >
      <Form.TextArea
        title="question"
        placeholder="Enter a question to chat with Hugging Face..."
        {...itemProps.question}
      />
    </Form>
  );
}
