import { Form, getPreferenceValues } from "@raycast/api";
import { ChatPreferences } from "./types/preferences";
import { generateResponse } from "./api/huggingface";
import { useEffect } from "react";

export default function Command() {
  
  const preferences = getPreferenceValues<ChatPreferences>();
  console.log(preferences);

  useEffect(() => {
    void generateResponse();
  }, [])

  return (
    <Form>
      <Form.TextArea id="prompt" title="Prompt" placeholder="Enter a prompt to chat with Hugging Face..." />
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