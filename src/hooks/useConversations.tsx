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

  const saveToLocalStorage = async (conversations: Conversation[]) => {
    try {
      await LocalStorage.setItem("conversations", JSON.stringify(conversations));
    } catch (error) {
      showToast({
        title: "Failed to save conversation to LocalStorage",
        style: Toast.Style.Failure,
      });
      throw error;
    }
  };

  const add = useCallback(async (conversation: Conversation) => {
    const toast = await showToast({
      title: "Creating conversation...",
      style: Toast.Style.Animated,
    });
    setData((prev) => {
      const newData = [...prev, conversation];
      saveToLocalStorage(newData);
      return newData;
    });
    toast.title = "Conversation created!";
    toast.style = Toast.Style.Success;
  }, []);

  const update = useCallback(async (conversation: Conversation) => {
    const toast = await showToast({
      title: "Updating Conversation...",
      style: Toast.Style.Animated,
    });
    setData((prev) => {
      const newData = prev.map((q) => (q.id === conversation.id ? conversation : q));
      saveToLocalStorage(newData);
      return newData;
    });
    toast.title = "Conversation updated!";
    toast.style = Toast.Style.Success;
  }, []);

  const remove = useCallback(async (conversation: Conversation) => {
    const toast = await showToast({
      title: "Removing conversation...",
      style: Toast.Style.Animated,
    });
    setData((prev) => {
      const newData = prev.filter((q) => q.id !== conversation.id);
      saveToLocalStorage(newData);
      return newData;
    });
    toast.title = "Conversation removed!";
    toast.style = Toast.Style.Success;
  }, []);

  return useMemo(() => ({ data, isLoading, add, update, remove }), [data, isLoading, add, update, remove]);
}
