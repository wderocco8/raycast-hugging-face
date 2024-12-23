import { Action, ActionPanel, Form } from "@raycast/api";
import { generateResponse } from "./api/huggingface";
import { useState } from "react";

export default function Command() {
  const [output, setOutput] = useState<string>("");

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
          <Action.SubmitForm title="Submit Name" onSubmit={(values) => handleGenerateResponse(values.prompt)} />
        </ActionPanel>
      }
    >
      <Form.TextArea id="prompt" title="Prompt" placeholder="Enter a prompt to chat with Hugging Face..." />
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
