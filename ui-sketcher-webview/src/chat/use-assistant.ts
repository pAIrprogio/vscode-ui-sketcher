import OpenAI from "openai";
import useConstant from "use-constant";
import { proxy, useSnapshot } from "valtio";

import {
  Assistant,
  Thread,
  createAssistant,
  createThread,
} from "../domain/assistant";
import { Message, SystemMessage, ToolStep, UserMessage } from "./chat.types";
import { never } from "../ts.utils";

const createChatStore = () => {
  const openAIClient = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  let assistant: Assistant | null = null;
  let thread: Thread | null = null;

  const history = proxy<Message[]>([]);

  const sendMessage = async (text: string) => {
    const userMessage: UserMessage = proxy({
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    });

    history.push(userMessage);

    const systemMessage: SystemMessage = proxy({
      id: crypto.randomUUID(),
      role: "system",
      state: "thinking",
      steps: [],
    });

    history.push(systemMessage);

    if (!assistant)
      assistant = await createAssistant({
        openAIClient,
        systemPrompt: "Hello, I'm a bot that helps you design UIs.",
      });

    if (!thread)
      thread = await createThread({
        openAIClient,
        assistant,
      });

    const iterator = thread.sendMessage(text);

    let lastRunningToolStep: ToolStep | null = null;

    try {
      for await (const update of iterator) {
        switch (update.type) {
          case "message_sent":
            userMessage.id = update.id;
            break;
          case "cancelling":
            systemMessage.state = "cancelling";
            break;
          case "expired":
            systemMessage.state = "expired";
            break;
          case "cancelled":
            systemMessage.state = "cancelled";
            break;
          case "completed":
            systemMessage.id = update.id;
            systemMessage.state = "done";
            systemMessage.steps.push({
              type: "message",
              content: update.message,
            });
            break;
          case "executing_actions":
            systemMessage.state = "thinking";
            const step = proxy<ToolStep>({
              type: "tools",
              status: "running",
              tools: update.tools,
            });
            systemMessage.steps.push(step);
            lastRunningToolStep = step;
            break;
          case "executing_actions_done":
            systemMessage.state = "thinking";
            if (lastRunningToolStep) {
              lastRunningToolStep.status = "done";
              lastRunningToolStep.tools = update.tools;
            }
            break;
          case "in_progress":
            systemMessage.state = "thinking";
            break;
          case "failed":
            systemMessage.state = "failed";
            break;
          case "queued":
            systemMessage.state = "thinking";
            break;
          default:
            never(update);
        }
      }
    } catch (error) {
      systemMessage.state = "failed";
      systemMessage.steps.push({
        type: "message",
        content: "There was a network error. Please try again.",
      });
    }
  };

  return {
    history,
    sendMessage,
  };
};

export const useAssistant = () => {
  const store = useConstant(() => {
    return createChatStore();
  });

  const history = useSnapshot(store.history);

  return {
    history,
    sendMessage: store.sendMessage,
  };
};
