// docs: https://huggingface.co/docs/huggingface.js/en/inference/README#text-generation-chat-completion-api-compatible

import { getPreferenceValues } from "@raycast/api";
import { ChatPreferences } from "../types/preferences";
import fetch from "node-fetch";
import { StreamedToken } from "../types/huggingface";
import { Question } from "../types/question";

const preferences = getPreferenceValues<ChatPreferences>();
const model = "meta-llama/Meta-Llama-3-8B-Instruct/v1";

export async function generateResponse(
  questions: Question[],
  questionId: string,
  setOutput: React.Dispatch<React.SetStateAction<string>>,
): Promise<string | false> {
  try {
    const lastIndex = questions.map((q) => q.id).indexOf(questionId);
    const filteredQuestions = questions.slice(0, lastIndex + 1);

    const response = await fetch(`https://api-inference.huggingface.co/models/${model}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${preferences.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/Meta-Llama-3-8B-Instruct",
        messages: filteredQuestions.map((q) => ({ role: "user", content: q.prompt })),
        max_tokens: 500,
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
        const lines = text.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const rawLine = line.slice(6).trim();

            if (rawLine === "[DONE]") {
              // Safely handle the end of the stream
              resolve(output);
              return;
            }

            try {
              const data: StreamedToken = JSON.parse(rawLine);
              const delta = data.choices[0].delta;

              if ("content" in delta) {
                output += delta.content;
                setOutput(output);
              }
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
