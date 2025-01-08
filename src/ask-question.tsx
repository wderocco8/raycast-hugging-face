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
  Color,
} from "@raycast/api";
import { generateResponse } from "./api/hugging-face";
import { useConversations } from "./hooks/useConversations";
import { useQuestions } from "./hooks/useQuestions";
import { v4 as uuidv4 } from "uuid";
import { Question } from "./types/question";
import { isValidQuestionPrompt } from "./utils/chat";
import AskQuestionForm from "./views/question/ask-question-form";
import { formatFullTime } from "./utils/date/time";
import { Model, ModelSelection } from "./types/model";
import { useModels } from "./hooks/useModels";

interface ChatProps {
  conversationId?: string;
}

export default function AskQuestion({ conversationId }: ChatProps) {
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
  const { data: models } = useModels();
  const [model, setModel] = useState<Model | null>(null);
  const defaultModel = { id: "default", name: "Default" } as const;
  const allModels: ModelSelection[] = [defaultModel, ...models];

  const handleAskQuestion = async (question: Question) => {
    if (!question.prompt) {
      // impossible with ActionsPanel conditions (I hope at least)
      showToast({
        style: Toast.Style.Failure,
        title: "Question cannot be empty",
      });
      return;
    }

    // Add model to question if exists
    if (model) {
      question = { ...question, modelId: model.id };
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
      const handleStreamingOutput = (output: string) => {
        setOutput(output);

        // Save progress to the question object
        updateQuestion({
          ...searchQuestion,
          response: output,
          isStreaming: true, // Keep streaming flag until finalized
        }, true);
      };

      const response = await generateResponse(allQuestions, question.id, handleStreamingOutput, model ?? undefined);
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

  const handleConfirmDelete = (question: Question) => {
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

  const handleSearchBarAccessoryChange = (model: ModelSelection) => {
    if (model.id === "default") {
      setModel(null);
    } else {
      setModel(model as Model);
    }
  };

  const renderMetaData = (question: Question) => {
    const model = models.find((m) => m.id === question.modelId)?.name;
    const isDefaultModel = !model;
    return (
      <List.Item.Detail.Metadata>
        <List.Item.Detail.Metadata.Label title="Question" text={question.prompt} />
        <List.Item.Detail.Metadata.Separator />
        <List.Item.Detail.Metadata.Label title="Date" text={formatFullTime(question.createdAt)} />
        <List.Item.Detail.Metadata.Separator />
        <List.Item.Detail.Metadata.TagList title="Model">
          {isDefaultModel ? (
            <List.Item.Detail.Metadata.TagList.Item text={"Default"} color={Color.SecondaryText} />
          ) : (
            <List.Item.Detail.Metadata.TagList.Item
              text={models.find((m) => m.id === question.modelId)?.name}
              color={Color.Blue}
            />
          )}
        </List.Item.Detail.Metadata.TagList>
      </List.Item.Detail.Metadata>
    );
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
              push(<AskQuestion />, async () => {
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
                onAction={() => handleConfirmDelete(question)}
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
      searchBarAccessory={
        <List.Dropdown
          tooltip="Select a model"
          onChange={(modelId) => {
            const selectedModel = allModels.find((m) => m.id === modelId);
            if (selectedModel) {
              handleSearchBarAccessoryChange(selectedModel);
            }
          }}
        >
          {allModels.map((model) => (
            <List.Dropdown.Item title={model.name} value={model.id} key={model.id} />
          ))}
        </List.Dropdown>
      }
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
                metadata={isShowingMetaData && renderMetaData(question)}
              />
            }
            actions={renderActions(question)}
          />
        ))
      )}
    </List>
  );
}
