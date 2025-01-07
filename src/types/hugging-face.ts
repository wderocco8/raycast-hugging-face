export interface StreamedToken {
  choices: Delta[];
  created: number;
  id: string;
  model: string;
  system_fingerprint: string;
  usage?: Usage;
}

type Delta = MessageDelta | ToolCallDelta;

interface MessageDelta {
  delta: {
    content: string;
    role: string;
  };
}

interface ToolCallDelta {
  delta: {
    role: string;
    tool_calls: {
      function: unknown;
      id: string;
      index: number;
      type: string;
    };
  };
}

interface Usage {
  completion_tokens: number;
  prompt_tokens: number;
  total_tokens: number;
}