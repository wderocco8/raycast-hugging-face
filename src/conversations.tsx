import { Action, ActionPanel, List, useNavigation } from "@raycast/api";
import { useConversations } from "./hooks/useConversations";
import { formatFullTime, formatRelativeTime } from "./utils/date/time";
import { useQuestions } from "./hooks/useQuestions";
import Chat from "./chat";

export default function Conversations() {
  const { data: conversations, isLoading: isLoadingConversations } = useConversations();
  const { getByConversation } = useQuestions();
  const { push } = useNavigation();

  return (
    <List isShowingDetail isLoading={isLoadingConversations}>
      {conversations.map((conversation) => (
        <List.Item
          key={conversation.id}
          id={conversation.id}
          title={conversation.title}
          accessories={[{ text: formatRelativeTime(conversation.createdAt) }]} // TODO: maybe remove?
          detail={
            <List.Item.Detail
              isLoading={false} // TODO: replace this with individual loader
              metadata={
                <List.Item.Detail.Metadata>
                  <List.Item.Detail.Metadata.Label title="Conversation Title" text={conversation.title} />
                  <List.Item.Detail.Metadata.Label title="Date Created" text={formatFullTime(conversation.createdAt)} />
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label title="Recent Questions" />
                  {getByConversation(conversation.id)
                    .slice(-5)
                    .map((q) => (
                      <List.Item.Detail.Metadata.Label title={`Q: ${q.prompt}`} key={q.id} />
                    ))}
                </List.Item.Detail.Metadata>
              }
            />
          }
          actions={
            <ActionPanel>
              <Action title="Push" onAction={() => push(<Chat conversationId={conversation.id} />)} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
