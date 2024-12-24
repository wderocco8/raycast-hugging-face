/**
 * AskQuestionForm Component
 *
 * This file defines a form-based "rich text" interface for users to interact with the Hugging Face API.
 * It allows users to input a prompt, sends the prompt to the API, and redirects back to the given conversation in chat.tsx.
 * 
 */

import { Action, ActionPanel, Form, showToast, Toast } from "@raycast/api";
import { generateResponse } from "../../api/huggingface";
import { useState } from "react";
import { FormValidation, useForm } from "@raycast/utils";

interface AskQuestionFormValues {
  prompt: string;
}

interface AskQuestionFormProps{
  initialQuestion: string
}

export default function AskQuestionForm({
  initialQuestion
}: AskQuestionFormProps) {
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const { handleSubmit, itemProps } = useForm<AskQuestionFormValues>({
    onSubmit(values) {
      if (loading) return; // Prevent duplicate submissions
      handleGenerateResponse(values.prompt);
    },
    initialValues: {
      prompt: initialQuestion
    },
    validation: {
      prompt: FormValidation.Required,
    },
  });

  const handleGenerateResponse = async (prompt: string) => {
    setLoading(true);
    showToast({
      style: Toast.Style.Animated,
      title: "Generating response...",
    });

    try {
      await generateResponse(prompt, setOutput);
      showToast({
        style: Toast.Style.Success,
        title: "Response generated!",
      });
    } catch (error) {
      console.error("Error in handleGenerateResponse:", error);
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to generate response. Please try again.",
      });
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
      <Form.TextArea title="Prompt" placeholder="Enter a prompt to chat with Hugging Face..." {...itemProps.prompt} />
      <Form.Description title="Output" text={output} />
    </Form>
  );
}

// export default function Command() {
//   const markdown = "API key incorrect. Please update it in extension preferences and try again.";

//   return (
//     <Detail
//       markdown={markdown}
//       actions={
//         <ActionPanel>
//           <Action title="Open Extension Preferences" onAction={openExtensionPreferences} />
//         </ActionPanel>
//       }
//     />
//   );
// }
