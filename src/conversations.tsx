import { useConversations } from "./hooks/useConversations";

export default function Conversations() {
  const { data: conversations } = useConversations();
  
  return <></>;
}
