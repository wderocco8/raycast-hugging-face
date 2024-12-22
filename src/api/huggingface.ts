// docs: https://huggingface.co/docs/huggingface.js/en/inference/README#text-generation-chat-completion-api-compatible

import { getPreferenceValues } from "@raycast/api";
import { ChatPreferences } from "../types/preferences";
import fetch from "node-fetch";
import { StreamedToken } from "../types/huggingface";

const preferences = getPreferenceValues<ChatPreferences>();

export async function generateResponse() {
  try {
    const response = await fetch("https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${preferences.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: "Can you help me solve an equation?",
        parameters: {
          max_tokens: 512,
          temperature: 0.1,
          return_full_text: false,
        },
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server responded with error:", errorText);
      throw new Error(errorText);
    }

    // Convert the response to a ReadableStream
    const stream = response.body;
    if (!stream) {
      return false;
    }

    // Use the Node.js stream methods instead of HFInference client
    return new Promise((resolve, reject) => {
      let output = "";
      const chunks: Buffer[] = [];

      stream.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
        const text = chunk.toString();
        // console.log("text", text);

        const lines = text.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data: StreamedToken = JSON.parse(line.slice(6));

              output += data.token.text;
              console.log("parsing output:", data.token.text);
            } catch (e) {
              console.error("Error parsing JSON:", e);
            }
          }
        }
      });

      stream.on("end", () => {
        resolve(output);
      });

      stream.on("error", (err) => {
        reject(err);
      });
    });
  } catch (error) {
    console.error("Error generating response:", error);
    throw error;
  }
}
