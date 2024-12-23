import { Action, ActionPanel, Form, showToast, Toast } from "@raycast/api";
import { generateResponse } from "./api/huggingface";
import { useState } from "react";
import { FormValidation, useForm } from "@raycast/utils";

interface ChatFormValues {
  prompt: string;
}

export default function Command() {
  const [output, setOutput] = useState<string>("");

  const { handleSubmit, itemProps } = useForm<ChatFormValues>({
    onSubmit(values) {
      handleGenerateResponse(values.prompt);
      showToast({
        style: Toast.Style.Success,
        title: "Yay!",
        message: "Response created",
      });
    },
    validation: {
      prompt: FormValidation.Required,
    },
  });

  const handleGenerateResponse = async (prompt: string) => {
    try {
      await generateResponse(prompt, setOutput);
    } catch (error) {
      console.error("Error in handleGenerateResponse:", error);
    }
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Chat" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextArea title="Prompt" placeholder="Enter a prompt to chat with Hugging Face..." {...itemProps.prompt} />
      <Form.Description title="Streamed Output" text={output} />
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
