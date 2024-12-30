import { useState } from "react";
import { Action, ActionPanel, Icon, List, showToast, Toast } from "@raycast/api";
import { generateResponse } from "./api/huggingface";
// import { useConversations } from "./hooks/useConversations";
import { useQuestions } from "./hooks/useQuestions";
import { v4 as uuidv4 } from "uuid";
import { Question } from "./types/question";
import { isValidQuestionPrompt } from "./utils/chat";

export default function Chat() {
  const [searchQuestion, setSearchQuestion] = useState<Question>({
    id: uuidv4(),
    conversationId: uuidv4(), // conversation will be generated by the question (TODO: maybe this will change)
    prompt: "",
    response: "",
    createdAt: new Date().toISOString(),
    isStreaming: true,
  });
  const [output, setOutput] = useState<string>("");
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  // const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // const { data: conversatons, add: addConversation } = useConversations();
  const { data: questions, isLoading: isLoadingQuestions, add: addQuestion, update: updateQuestion } = useQuestions();

  console.log("selected", selectedQuestionId);
  console.log(
    "questions",
    questions?.map((q) => [q.id, q.prompt]),
  );

  // TODO: don't create conversation until a question is asked

  const handleAskQuestion = async (question: Question) => {
    if (!question.prompt) {
      // impossible with ActionsPanel conditions (I hope at least)
      showToast({
        style: Toast.Style.Failure,
        title: "Question cannot be empty",
      });
      return;
    }

    // Clear output and update current question
    setOutput("");
    setSearchQuestion(question); // TODO: somehow this is very necessary, why???

    await addQuestion(question);
    setSelectedQuestionId(question.id);
    showToast({
      style: Toast.Style.Animated,
      title: "Asking question...",
    });

    try {
      const response = await generateResponse(question.prompt, setOutput);
      if (response) {
        // Update with finalized response
        await updateQuestion({ ...question, response, isStreaming: false });
        showToast({
          style: Toast.Style.Success,
          title: "Response complete!",
        });
      } else {
        console.error("Stream issue perhaps?");
      }

      // Create a new FRESH question (with same conversation id)
      setSearchQuestion((prevQuestion) => ({
        id: uuidv4(),
        conversationId: prevQuestion.conversationId,
        prompt: "",
        response: "",
        createdAt: new Date().toISOString(),
        isStreaming: true,
      }));
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
      searchText={searchQuestion.prompt}
      onSearchTextChange={(prompt) => {
        setSearchQuestion((prevQuestion) => ({ ...prevQuestion, prompt }));
      }}
      searchBarPlaceholder="Ask a question..."
      isLoading={isLoadingQuestions}
      selectedItemId={selectedQuestionId ?? undefined}
      onSelectionChange={setSelectedQuestionId}
      actions={
        isValidQuestionPrompt(searchQuestion.prompt) ? (
          <ActionPanel>
            <Action title="Ask Question" onAction={() => handleAskQuestion(searchQuestion)} />
          </ActionPanel>
        ) : null
      }
    >
      {questions.map((question) => (
        <List.Item
          id={question.id}
          key={question.id}
          title={{ value: question.prompt, tooltip: question.prompt }}
          accessories={question.isStreaming ? [{ icon: Icon.Dot }] : undefined}
          detail={
            <List.Item.Detail
              markdown={question.id === selectedQuestionId ? question.response || output : question.response}
            />
          }
          actions={
            isValidQuestionPrompt(searchQuestion.prompt) ? (
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
