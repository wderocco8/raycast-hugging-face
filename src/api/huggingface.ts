// docs: https://huggingface.co/docs/huggingface.js/en/inference/README#text-generation-chat-completion-api-compatible

// import { HfInference } from "@huggingface/inference";
import { getPreferenceValues } from "@raycast/api";
import { ChatPreferences } from "../types/preferences";
import fetch from "cross-fetch";

const preferences = getPreferenceValues<ChatPreferences>();
// const hf = new HfInference(preferences.access_token, { fetch });

export async function generateResponse() {
  try {
    const response = await fetch("https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${preferences.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: [{ role: "user", content: "Can you help me solve an equation?" }],
        parameters: {
          max_tokens: 512,
          temperature: 0.1,
        },
        stream: true,
        fetch: fetch,
      }),
    });

    let output = "";

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      return false;
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      const lines = text.split("\n").filter((line) => line.trim() !== "");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.choices && data.choices.length > 0) {
              output += data.choices[0].delta.content || "";
            }
          } catch (e) {
            console.error("Error parsing JSON:", e);
          }
        }
      }
    }

    return output;
  } catch (error) {
    console.error("Error generating response:", error);
    throw error;
  }
}
