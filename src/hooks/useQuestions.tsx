import { LocalStorage, showToast, Toast } from "@raycast/api";
import { useState, useEffect, useCallback, useMemo } from "react";
import { QuestionsHook, Question } from "../types/question";

export function useQuestions(): QuestionsHook {
  const [data, setData] = useState<Question[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      const stored = await LocalStorage.getItem<string>("questions");
      if (stored) {
        setData(JSON.parse(stored));
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    try {
      LocalStorage.setItem("questions", JSON.stringify(data));
    } catch (error) {
      showToast({
        title: "Failed to save questions to LocalStorage",
        style: Toast.Style.Failure,
      });
    }
  }, [data]);

  const add = useCallback(async (question: Question) => {
    const toast = await showToast({
      title: "Saving question...",
      style: Toast.Style.Animated,
    });
    setData((prev) => [...prev, question]);
    toast.title = "Question saved!";
    toast.style = Toast.Style.Success;
  }, []);

  const update = useCallback(async (question: Question) => {
    const toast = await showToast({
      title: "Updating question...",
      style: Toast.Style.Animated,
    });
    setData((prev) => prev.map((q) => (q.id === question.id ? question : q)));
    toast.title = "Question updated!";
    toast.style = Toast.Style.Success;
  }, []);

  const remove = useCallback(async (question: Question) => {
    const toast = await showToast({
      title: "Removing question...",
      style: Toast.Style.Animated,
    });
    setData((prev) => prev.filter((q) => q.id !== question.id));
    toast.title = "Question removed!";
    toast.style = Toast.Style.Success;
  }, []);

  const getByConversation = useCallback(
    (conversationId: string) => {
      return data.filter((q) => q.conversation_id === conversationId);
    },
    [data],
  );

  return useMemo(
    () => ({ data, isLoading, add, update, remove, getByConversation }),
    [data, isLoading, add, update, remove, getByConversation],
  );
}
