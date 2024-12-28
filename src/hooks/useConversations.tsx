import { LocalStorage, showToast, Toast } from "@raycast/api";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Conversation, ConversationsHook } from "../types/conversation";

export function useConversations(): ConversationsHook {
  const [data, setData] = useState<Conversation[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      const stored = await LocalStorage.getItem<string>("conversations");
      if (stored) {
        setData(JSON.parse(stored));
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    try {
      LocalStorage.setItem("conversations", JSON.stringify(data));
    } catch (error) {
      showToast({
        title: "Failed to save conversation to LocalStorage",
        style: Toast.Style.Failure,
      });
    }
  }, [data]);

  const add = useCallback(async (conversation: Conversation) => {
    const toast = await showToast({
      title: "Creating conversation...",
      style: Toast.Style.Animated,
    });
    setData((prev) => [...prev, conversation]);
    toast.title = "Conversation created!";
    toast.style = Toast.Style.Success;
  }, []);

  const update = useCallback(async (conversation: Conversation) => {
    const toast = await showToast({
      title: "Updating Conversation...",
      style: Toast.Style.Animated,
    });
    setData((prev) => prev.map((q) => (q.id === conversation.id ? conversation : q)));
    toast.title = "Conversation updated!";
    toast.style = Toast.Style.Success;
  }, []);

  const remove = useCallback(async (conversation: Conversation) => {
    const toast = await showToast({
      title: "Removing conversation...",
      style: Toast.Style.Animated,
    });
    setData((prev) => prev.filter((q) => q.id !== conversation.id));
    toast.title = "Conversation removed!";
    toast.style = Toast.Style.Success;
  }, []);

  return useMemo(() => ({ data, isLoading, add, update, remove }), [data, isLoading, add, update, remove]);
}
