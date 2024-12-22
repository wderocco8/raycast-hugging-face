export interface StreamedToken {
  index: number;
  token: {
    id: number;
    text: string;
    logprob: number;
    special: boolean;
  };
  generated_text: string | null
  details: unknown | null;
}
