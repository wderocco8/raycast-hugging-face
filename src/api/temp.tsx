// docs: https://huggingface.co/docs/huggingface.js/en/inference/README#text-generation-chat-completion-api-compatible

import { HfInference } from "@huggingface/inference";
import { getPreferenceValues } from "@raycast/api";
import { ChatPreferences } from "../types/preferences";
import fetch from "cross-fetch";
import { ReadableStream } from "web-streams-polyfill";


global.ReadableStream = ReadableStream as unknown as typeof global.ReadableStream;
// if (typeof global.ReadableStream === "undefined") {
// }

const preferences = getPreferenceValues<ChatPreferences>();
console.log("Stream support after polyfill:", !!global.ReadableStream);


const hf = new HfInference(preferences.access_token, { fetch });

export async function generateResponse() {
  let out = "";
  for await (const chunk of hf.chatCompletionStream({
    model: "meta-llama/Meta-Llama-3-8B-Instruct",
    messages: [{ role: "user", content: "Can you help me solve an equation?" }],
    max_tokens: 512,
    temperature: 0.1,
  })) {
    if (chunk.choices && chunk.choices.length > 0) {
      out += chunk.choices[0].delta.content;
    }
  }
  return out;
}

// export async function generateResponse() {
//   try {
//     const response = await hf.chatCompletion({
//       model: "meta-llama/Meta-Llama-3-8B-Instruct",
//       messages: [{ role: "user", content: "Can you help me solve an equation?" }],
//       max_tokens: 512,
//       temperature: 0.1,
//     });

//     console.log("STREAMMM", response.choices);
//   } catch (error) {
//     console.error("Error generating response:", error);
//     throw error;
//   }
// }