import OpenAI from "openai";
import useConstant from "use-constant";
import { proxy, useSnapshot } from "valtio";
import { createAssistant, createThread } from "../domain/assistant";
import {
  Message,
  RunningToolStep,
  SystemMessage,
  ToolStep,
} from "./chat.types";
import { never } from "../ts.utils";

const chatStore = async () => {
  const openAIClient = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  });

  const assistant = await createAssistant({
    openAIClient,
    systemPrompt: "Hello, I'm a bot that helps you design UIs.",
  });

  const thread = await createThread({
    openAIClient,
    assistant,
  });

  const history = proxy<Message[]>([]);

  const sendMessage = async (text: string) => {
    const iterator = thread.sendMessage(text);

    const systemMessage: SystemMessage = proxy({
      role: "system",
      state: "thinking",
      steps: [],
    });

    let lastRunningToolStep: ToolStep | null = null;

    for await (const update of iterator) {
      switch (update.type) {
        case "message_sent":
          const userMessage: Message = {
            id: update.id,
            role: "user",
            content: text,
          };
          history.push(userMessage);
          history.push(systemMessage);
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
          systemMessage.state = "done";
          systemMessage.steps.push({
            type: "message",
            content: update.message,
          });
          break;
        case "executing_actions":
          const step = proxy<ToolStep>({
            type: "tools",
            status: "running",
            tools: update.tools,
          });
          systemMessage.steps.push(step);
          lastRunningToolStep = step;
          break;
        case "executing_actions_done":
          if (lastRunningToolStep) {
            lastRunningToolStep.status = "done";
            lastRunningToolStep.tools = update.tools;
          }
          break;
        case "in_progress":
          break;
        case "failed":
          break;
        case "queued":
          break;
        default:
          never(update);
      }
    }
  };
};

export const useAssistant = () => {
  const state = useConstant(() => {
    return proxy({});
  });
  const snap = useSnapshot(state);

  return {
    state,
    snap,
  };
};
