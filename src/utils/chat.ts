export const isValidQuestion = (prompt: string, isAskingQuestion: boolean) => {
  if (prompt.trim() === "" || isAskingQuestion) {
    return false;
  } else {
    return true;
  }
};
