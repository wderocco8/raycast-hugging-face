import { Action, ActionPanel, Alert, confirmAlert, Keyboard, List, useNavigation, Image } from "@raycast/api";
import { useConversations } from "./hooks/useConversations";
import { formatFullTime, formatRelativeTime } from "./utils/date/time";
import AskQuestion from "./ask-question";
import { Conversation } from "./types/conversation";
import ConversationForm from "./views/conversations/conversation-form";
import { useState } from "react";

export default function Conversations() {
  const {
    data: conversations,
    isLoading: isLoadingConversations,
    remove: removeConversation,
    refresh,
  } = useConversations();
  const { push } = useNavigation();
  const [updateKey, setUpdateKey] = useState(0);

  // TODO: maybe add description of conversation? (would be cool if it were AI generated...)
  const markdown = (conversation: Conversation) =>
    `
  **Description:** [AI summary of convo -> based on first question]
  `.trim();

  const handleConfirmDelete = (conversation: Conversation) => {
    return confirmAlert({
      title: "Delete this conversation?",
      message: "You will not be able to recover it",
      primaryAction: {
        title: "Delete",
        style: Alert.ActionStyle.Destructive,
        onAction: () => removeConversation(conversation),
      },
      dismissAction: {
        title: "Cancel",
      },
    });
  };

  const renderListActions = () => (
    <ActionPanel>
      <Action
        title="New Conversation"
        shortcut={Keyboard.Shortcut.Common.New}
        onAction={() =>
          push(<AskQuestion />, async () => {
            await refresh(); // Refresh question-enriched conversations
            setUpdateKey((prev) => prev + 1); // Suposedly this force re-renders the List (can't tell tbh)
          })
        }
      />
    </ActionPanel>
  );

  const renderListItemActions = (conversation: Conversation) => (
    <ActionPanel>
      <Action
        title="Open Conversation"
        onAction={() =>
          push(<AskQuestion conversationId={conversation.id} />, async () => {
            await refresh(); // Refresh question-enriched conversations
            setUpdateKey((prev) => prev + 1); // Suposedly this force re-renders the List (can't tell tbh)
          })
        }
      />
      <Action
        title="Update Conversation"
        shortcut={Keyboard.Shortcut.Common.Edit}
        onAction={() =>
          push(<ConversationForm conversationId={conversation.id} />, async () => {
            await refresh();
            setUpdateKey((prev) => prev + 1);
          })
        }
      />
      <Action
        title="New Conversation"
        shortcut={Keyboard.Shortcut.Common.New}
        onAction={() =>
          push(<AskQuestion />, async () => {
            await refresh(); // Refresh question-enriched conversations
            setUpdateKey((prev) => prev + 1); // Suposedly this force re-renders the List (can't tell tbh)
          })
        }
      />
      <Action
        title="Delete Conversation"
        style={Action.Style.Destructive}
        shortcut={Keyboard.Shortcut.Common.Remove}
        onAction={() => handleConfirmDelete(conversation)}
      />
    </ActionPanel>
  );

  return (
    <List
      isShowingDetail={conversations.length !== 0}
      isLoading={isLoadingConversations}
      key={updateKey}
      actions={renderListActions()}
    >
      {conversations.length === 0 ? (
        <List.EmptyView
          icon={{ source: "no-conversations.jpeg", mask: Image.Mask.RoundedRectangle }}
          title="No conversations yet"
          description="Start making conversations with your AI wizard 🧙‍♂️"
        />
      ) : (
        conversations.map((conversation) => (
          <List.Item
            key={conversation.id}
            id={conversation.id}
            title={conversation.title}
            accessories={[{ text: formatRelativeTime(conversation.createdAt) }]} // TODO: maybe remove?
            detail={
              <List.Item.Detail
                isLoading={isLoadingConversations}
                markdown={markdown(conversation)}
                metadata={
                  <List.Item.Detail.Metadata>
                    <List.Item.Detail.Metadata.Label title="Conversation Title" text={conversation.title} />
                    <List.Item.Detail.Metadata.Label
                      title="Date Created"
                      text={formatFullTime(conversation.createdAt)}
                    />
                    <List.Item.Detail.Metadata.Label
                      title="Question Count"
                      text={conversation.questions?.length.toString() ?? "0"}
                    />
                    <List.Item.Detail.Metadata.Separator />
                    <List.Item.Detail.Metadata.Label title="Recent Questions" />
                    {conversation.questions?.map((q) => (
                      <List.Item.Detail.Metadata.Label title={`Q: ${q.prompt}`} key={q.id} />
                    ))}
                  </List.Item.Detail.Metadata>
                }
              />
            }
            actions={renderListItemActions(conversation)}
          />
        ))
      )}
    </List>
  );
}
