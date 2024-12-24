import { useState } from "react";
import { Action, ActionPanel, List, showToast, Toast } from "@raycast/api";
import { generateResponse } from "./api/huggingface";

const questions: { content: string }[] = [
  {
    content: "How do I code this",
  },
  {
    content: "How do I code that",
  },
];

export default function Chat() {
  const [searchQuestion, setSearchQuestion] = useState<string | null>(null);
  const [output, setOutput] = useState<string>("");

  const handleAskQuestion = async (question: string | null) => {
    if (!question) {
      showToast({
        style: Toast.Style.Failure,
        title: "Question cannot be empty",
      });
      return;
    }

    setOutput("");
    setSearchQuestion(question);

    showToast({
      style: Toast.Style.Animated,
      title: "Asking question...",
    });

    try {
      await generateResponse(question, setOutput);
      showToast({
        style: Toast.Style.Success,
        title: "Response complete!",
      });
    } catch (error) {
      console.error("Error generating response:", error);
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to generate response. Please try again.",
      });
    }
  };

  return (
    <List
      isShowingDetail={true}
      onSearchTextChange={(text) => {
        setSearchQuestion(text ? text : null);
      }}
      searchBarPlaceholder="Search or ask a question..."
      actions={
        searchQuestion ? (
          <ActionPanel>
            <Action title="Ask Question" onAction={() => handleAskQuestion(searchQuestion)} />
          </ActionPanel>
        ) : null
      }
    >
      {questions.map((question) => (
        <List.Item
          key={question.content}
          title={question.content}
          detail={<List.Item.Detail markdown={output || "Select a question to see the response."} />}
          actions={
            searchQuestion ? (
              <ActionPanel>
                <Action title="Ask Question" onAction={() => handleAskQuestion(searchQuestion)} />
              </ActionPanel>
            ) : null
          }
        />
      ))}
    </List>
  );
}
