/**
 * chat Command
 *
 * This file defines a...
 *
 */

import { useState } from "react";
import {
  Action,
  ActionPanel,
  Alert,
  confirmAlert,
  Icon,
  Keyboard,
  List,
  showToast,
  Toast,
  useNavigation,
  Image,
} from "@raycast/api";
import { generateResponse } from "./api/huggingface";
import { useConversations } from "./hooks/useConversations";
import { useQuestions } from "./hooks/useQuestions";
import { v4 as uuidv4 } from "uuid";
import { Question } from "./types/question";
import { isValidQuestionPrompt } from "./utils/chat";
import AskQuestionForm from "./views/question/AskQuestionForm";
import { formatFullTime } from "./utils/date/time";

interface ChatProps {
  conversationId?: string;
}

export default function Chat({ conversationId }: ChatProps) {
  const { push } = useNavigation();

  const [searchQuestion, setSearchQuestion] = useState<Question>({
    id: uuidv4(),
    conversationId: conversationId ?? uuidv4(), // conversation will be generated by the question (unless provided by `conversations` command)
    prompt: "",
    response: "",
    createdAt: new Date().toISOString(),
    isStreaming: true,
  });
  const [output, setOutput] = useState<string>("");
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [isAskingQuestion, setIsAskingQuestion] = useState<boolean>(false);
  const [isShowingMetaData, setIsShowingMetadata] = useState<boolean>(true);
  const { add: addConversation } = useConversations();
  const {
    isLoading: isLoadingQuestions,
    getByConversationId,
    add: addQuestion,
    update: updateQuestion,
    remove: removeQuestion,
    refresh: refreshQuestions,
  } = useQuestions();
  const questions = getByConversationId(searchQuestion.conversationId);

  const handleAskQuestion = async (question: Question) => {
    if (!question.prompt) {
      // impossible with ActionsPanel conditions (I hope at least)
      showToast({
        style: Toast.Style.Failure,
        title: "Question cannot be empty",
      });
      return;
    }

    // Create new conversation if first question
    if (questions.length === 0) {
      await addConversation({
        id: conversationId ?? question.conversationId,
        title: "Untitled Conversation",
        createdAt: new Date().toISOString(),
      });
    }

    // Clear output and stop showing ActionPanel
    setOutput("");
    setIsAskingQuestion(true);

    // Take snapshot of questions (for generateResponse) and add new question
    const allQuestions = [...questions, question];
    await addQuestion(question);

    // Select the asked question
    setSelectedQuestionId(question.id);
    showToast({
      style: Toast.Style.Animated,
      title: "Asking question...",
    });

    // Create a new FRESH question (with same conversation id)
    setSearchQuestion((prevQuestion) => ({
      id: uuidv4(),
      conversationId: prevQuestion.conversationId,
      prompt: "",
      response: "",
      createdAt: new Date().toISOString(),
      isStreaming: true,
    }));

    try {
      const response = await generateResponse(allQuestions, question.id, setOutput);
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
    } catch (error) {
      console.error("Error generating response:", error);
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to generate response. Please try again.",
      });
    } finally {
      setIsAskingQuestion(false);
    }
  };

  const handleConfirmAlert = (question: Question) => {
    return confirmAlert({
      title: "Delete this question?",
      message: "You will not be able to recover it",
      primaryAction: {
        title: "Delete",
        style: Alert.ActionStyle.Destructive,
        onAction: () => removeQuestion(question),
      },
      dismissAction: {
        title: "Cancel",
      },
    });
  };

  const renderActions = (question?: Question) =>
    !isAskingQuestion && (
      <ActionPanel>
        <ActionPanel.Section>
          {isValidQuestionPrompt(searchQuestion.prompt) && (
            <Action title="Ask Question" onAction={() => handleAskQuestion({ ...searchQuestion })} />
          )}
          <Action
            title="Rich Text Question"
            shortcut={{ modifiers: ["cmd"], key: "t" }}
            onAction={() =>
              push(<AskQuestionForm initialQuestion={searchQuestion} onQuestionSubmit={handleAskQuestion} />)
            }
          />
          <Action
            title="New Conversation"
            shortcut={Keyboard.Shortcut.Common.New}
            onAction={() =>
              push(<Chat />, async () => {
                await refreshQuestions();
              })
            }
          />
          <Action
            title="Toggle Metadata"
            shortcut={{ modifiers: ["cmd"], key: "m" }}
            onAction={() => setIsShowingMetadata((prev) => !prev)}
          />
        </ActionPanel.Section>
        {/* ListItem-specific */}
        {question && (
          <>
            <ActionPanel.Section>
              <Action.CopyToClipboard content={question.response} shortcut={Keyboard.Shortcut.Common.Copy} />
            </ActionPanel.Section>
            <ActionPanel.Section>
              <Action
                title="Delete Question"
                style={Action.Style.Destructive}
                shortcut={Keyboard.Shortcut.Common.Remove}
                onAction={() => handleConfirmAlert(question)}
              />
            </ActionPanel.Section>
          </>
        )}
      </ActionPanel>
    );

  return (
    <List
      isShowingDetail={questions.length !== 0}
      searchText={searchQuestion.prompt}
      onSearchTextChange={(prompt) => {
        setSearchQuestion((prevQuestion) => ({ ...prevQuestion, prompt }));
      }}
      searchBarPlaceholder="Ask a question..."
      isLoading={isLoadingQuestions}
      selectedItemId={selectedQuestionId ?? undefined}
      // TODO: this might be an issue with Raycast itself (another extension had the same error https://github.com/raycast/extensions/issues/10844)
      // onSelectionChange causes race condition :..(
      actions={renderActions()}
    >
      {questions.length === 0 ? (
        <List.EmptyView
          icon={{ source: "no-questions.jpeg", mask: Image.Mask.RoundedRectangle }}
          title="No questions yet"
          description="Get your questions answered with the power of AI 🧙‍♂️"
        />
      ) : (
        questions.map((question) => (
          <List.Item
            id={question.id}
            key={question.id}
            title={{ value: question.prompt, tooltip: question.prompt }}
            accessories={question.isStreaming ? [{ icon: Icon.Dot }] : undefined}
            detail={
              <List.Item.Detail
                markdown={question.id === selectedQuestionId ? question.response || output : question.response}
                metadata={
                  isShowingMetaData && (
                    <List.Item.Detail.Metadata>
                      <List.Item.Detail.Metadata.Label title="Question" text={question.prompt} />
                      <List.Item.Detail.Metadata.Separator />
                      <List.Item.Detail.Metadata.Label title="Date" text={formatFullTime(question.createdAt)} />
                    </List.Item.Detail.Metadata>
                  )
                }
              />
            }
            actions={renderActions(question)}
          />
        ))
      )}
    </List>
  );
}
