import { z } from 'zod';

import { experimental_PaidMcpAgent as PaidMcpAgent } from '@stripe/agent-toolkit/cloudflare';
import { vibeCoderInputSchema } from './vibeCoder';

export const vibeCoderInputSchema = z.object({
  userInputPrompt: z.string(),
});

export function vibeCoderTool(agent: PaidMcpAgent<Env, any, any>) {
  return agent.server.tool({
    name: "processWithVibeCoder",
    description: "This tool takes a user's prompt (containing unstructured notes, links, ideas, etc.) and processes it using the Vibe Coder meta-prompt to generate a structured set of preliminary software requirements. The processing is done by an advanced AI assistant acting as 'Vibe Coder'.",
    inputSchema: vibeCoderInputSchema,
    handler: async ({ userInputPrompt }) => {
      const outputStructure = `This output will be populated by an AI assistant (Vibe Coder) based on the user's input and the Vibe Coder meta-prompt. The following is the structured format:

## Executive Summary:
[Brief overview of the project and its purpose]

## Key Goals:
[List of primary objectives for the software]

## Target Audience:
[Description of the intended users]

## Functional Requirements:
[Detailed list of features and functionalities]
  - User Story 1: [As a user, I want to...]
  - User Story 2: [As a user, I want to...]

## Non-Functional Requirements:
[Performance, security, usability, etc.]
  - Performance: [Specific metrics]
  - Security: [Security considerations]

## Out of Scope:
[Features or functionalities not to be included]

## Technical Considerations (Optional):
[Preferred technologies, platforms, etc.]

## Success Metrics:
[How the success of the project will be measured]

## Notes & Open Questions:
[Any additional comments or unresolved issues]
`;
      return {
        content: [{ type: "text", text: outputStructure }],
      };
    },
  });
}
