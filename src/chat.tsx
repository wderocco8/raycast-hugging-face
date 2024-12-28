import { useState } from "react";
import { Action, ActionPanel, List, showToast, Toast } from "@raycast/api";
import { generateResponse } from "./api/huggingface";
import { useConversations } from "./hooks/useConversations";
import { useQuestions } from "./hooks/useQuestions";

export default function Chat() {
  const [searchQuestion, setSearchQuestion] = useState<string | null>(null);
  const [output, setOutput] = useState<string>("");

  const { add: addConversation } = useConversations();
  const { data: questions, isLoading: isLoadingQuestions, add: addQuestion } = useQuestions();

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
          key={question.id}
          title={question.prompt}
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
