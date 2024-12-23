// docs: https://huggingface.co/docs/huggingface.js/en/inference/README#text-generation-chat-completion-api-compatible

import { getPreferenceValues } from "@raycast/api";
import { ChatPreferences } from "../types/preferences";
import fetch from "node-fetch";
import { StreamedToken } from "../types/huggingface";

const preferences = getPreferenceValues<ChatPreferences>();

export async function generateResponse(prompt: string, setOutput: React.Dispatch<React.SetStateAction<string>>) {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${preferences.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/Meta-Llama-3-8B-Instruct",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 500,
          stream: false
        }),
      }
    );

    const data = await response.json()

    console.log("hit api", data.choices[0].message);
    return


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
        const lines = text.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data: StreamedToken = JSON.parse(line.slice(6));

              output += data.token.text;
              setOutput(output);
              console.log("parsing output:", data.token.text); // TODO: remove log
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
