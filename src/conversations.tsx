import { Icon, List } from "@raycast/api";
import { useConversations } from "./hooks/useConversations";
import { formatRelativeTime } from "./utils/date/time";

export default function Conversations() {
  const { data: conversations, isLoading: isLoadingConversations } = useConversations();


  return (
    <List>
      {conversations.map((conversation) => (
        <List.Item
          id={conversation.id}
          title={conversation.title}
          accessories={[{ icon: Icon.Clock, text: formatRelativeTime(conversation.createdAt) }]}
        />
      ))}
    </List>
  );
}
