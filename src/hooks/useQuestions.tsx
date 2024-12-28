import { LocalStorage, showToast, Toast } from "@raycast/api";
import { useState, useEffect, useCallback, useMemo } from "react";
import { QuestionsHook, Question } from "../types/question";

export function useQuestions(): QuestionsHook {
  const [data, setData] = useState<Question[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log("useEffect questions");
    (async () => {
      const stored = await LocalStorage.getItem<string>("questions");
      if (stored) {
        
        setData(JSON.parse(stored));
      }
      setLoading(false);
    })();
  }, []);

  const saveToLocalStorage = async (questions: Question[]) => {
    try {
      await LocalStorage.setItem("questions", JSON.stringify(questions));
    } catch (error) {
      showToast({
        title: "Failed to save question",
        style: Toast.Style.Failure,
      });
      throw error;
    }
  };

  const add = useCallback(async (question: Question) => {
    const toast = await showToast({
      title: "Saving question...",
      style: Toast.Style.Animated,
    });
    setData((prev) => {
      const newData = [...prev, question];
      saveToLocalStorage(newData);
      return newData;
    });
    toast.title = "Question saved!";
    toast.style = Toast.Style.Success;
  }, []);

  const update = useCallback(async (question: Question) => {
    const toast = await showToast({
      title: "Updating question...",
      style: Toast.Style.Animated,
    });
    setData((prev) => {
      const newData = prev.map((q) => (q.id === question.id ? question : q));
      saveToLocalStorage(newData);
      return newData;
    });
    toast.title = "Question updated!";
    toast.style = Toast.Style.Success;
  }, []);

  const remove = useCallback(async (question: Question) => {
    const toast = await showToast({
      title: "Removing question...",
      style: Toast.Style.Animated,
    });
    setData((prev) => {
      const newData = prev.filter((q) => q.id !== question.id);
      saveToLocalStorage(newData);
      return newData;
    });
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
