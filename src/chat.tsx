import { Action, ActionPanel, Form, showToast, Toast } from "@raycast/api";
import { generateResponse } from "./api/huggingface";
import { useState } from "react";
import { FormValidation, useForm } from "@raycast/utils";

interface ChatFormValues {
  prompt: string;
}

export default function Chat() {
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const { handleSubmit, itemProps } = useForm<ChatFormValues>({
    onSubmit(values) {
      if (loading) return; // Prevent duplicate submissions
      handleGenerateResponse(values.prompt);
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
