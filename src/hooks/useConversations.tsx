import { LocalStorage, showToast, Toast } from "@raycast/api";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Conversation, ConversationsHook } from "../types/conversation";
import { useQuestions } from "./useQuestions";

export function useConversations(): ConversationsHook {
  const [data, setData] = useState<Conversation[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const { getByConversationId, removeByConversationId, isLoading: isLoadingQuestions } = useQuestions();

  useEffect(() => {
    if (isLoadingQuestions) {
      return;
    }

    (async () => {
      const stored = await LocalStorage.getItem<string>("conversations");
      if (stored) {
        // Default conversations stored without questions
        const items: Conversation[] = JSON.parse(stored);
        const sortedItems = items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Enrich conversations with questions
        const enrichedItems = sortedItems.map((conversation) => ({
          ...conversation,
          questions: getByConversationId(conversation.id),
        }));

        setData(enrichedItems);
      }
      setLoading(false);
    })();
  }, [isLoadingQuestions]);

  const saveToLocalStorage = async (conversations: Conversation[]) => {
    try {
      await LocalStorage.setItem("conversations", JSON.stringify(conversations));
    } catch (error) {
      showToast({
        title: "Failed to save conversation",
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

    try {
      // Remove all questions in conversation
      await removeByConversationId(conversation.id);

      // Remove conversation
      setData((prev) => {
        const newData = prev.filter((q) => q.id !== conversation.id);
        saveToLocalStorage(newData);
        return newData;
      });
      toast.title = "Conversation removed!";
      toast.style = Toast.Style.Success;
    } catch (error) {
      console.error("Error removing conversation:", error);
      toast.title = "Failed to remove conversation";
      toast.style = Toast.Style.Failure;
    }
  }, []);

  return useMemo(() => ({ data, isLoading, add, update, remove }), [data, isLoading, add, update, remove]);
}
