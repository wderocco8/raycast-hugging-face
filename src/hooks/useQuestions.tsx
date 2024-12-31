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
    const newData = [question, ...data]; // Use the current state directly
    setData(newData); // Update state optimistically
    try {
      await saveToLocalStorage(newData); // Save to LocalStorage
      toast.title = "Question saved!";
      toast.style = Toast.Style.Success;
    } catch (error) {
      console.error("Failed to save question:", error);
      toast.title = "Failed to save question!";
      toast.style = Toast.Style.Failure;
    }
  }, [data]);

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
      return data.filter((q) => q.conversationId === conversationId);
    },
    [data],
  );

  return useMemo(
    () => ({ data, isLoading, add, update, remove, getByConversation }),
    [data, isLoading, add, update, remove, getByConversation],
  );
}
