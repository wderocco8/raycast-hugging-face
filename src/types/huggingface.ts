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
/**
 * {"object":"chat.completion.chunk","id":"","created":1734971499,"model":"meta-llama/Meta-Llama-3-8B-Instruct","system_fingerprint":"2.3.1-dev0-sha-169178b",,"logprobs":null,"finish_reason":null}],"usage":null}
 *
 *
 * "choices":[{"index":0,"delta":{"role":"assistant","content":"Hello"}
 */

/**
 * choices	object[]	
        delta	unknown	One of the following:
                 (#1)	object	
                        content	string	
                        role	string	
                 (#2)	object	
                        role	string	
                        tool_calls	object	
                                function	object	
                                        arguments	string	
                                        name	string	
                                id	string	
                                index	integer	
                                type	string	
        finish_reason	string	
        index	integer	
        logprobs	object	
                content	object[]	
                        logprob	number	
                        token	string	
                        top_logprobs	object[]	
                                logprob	number	
                                token	string	
 */
