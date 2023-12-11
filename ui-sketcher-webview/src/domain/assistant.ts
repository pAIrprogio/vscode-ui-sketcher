import OpenAI from "openai";
import { zip, map, toArray } from "iter-tools";
import { AssistantCreateParams } from "openai/resources/beta/assistants/assistants.mjs";

type PromiseValue<T> = T extends Promise<infer U> ? U : never;

const defaultErrorFormater = (error: any) => {
  if (typeof error === "string") return { success: false, error };
  if (error instanceof Error) return { success: false, error: error.message };

  return { success: false as const, error: JSON.stringify(error) };
};

type ErrorFormaterFn = typeof defaultErrorFormater;

const defaultSystemPrompt = `You're a senior developer at GAFA. Your objective is to assist the user into planning and executing on development tasks.
When modifying files, read the file content with line numbers and use a git patch to apply the changes. Don't wait for confirmation before executing commands`;

export type ToolFn = (...args: any[]) => Promise<any>;

export type AssistantConfig = {
  openAIClient: OpenAI;
  systemPrompt?: string;
  toolsSchema?: AssistantCreateParams.AssistantToolsFunction[];
  toolsFns?: {
    [key: string]: ToolFn;
  };
  errorFormater?: ErrorFormaterFn;
};

export const createAssistant = async (config: AssistantConfig) => {
  const openAIClient = config.openAIClient;
  const systemPrompt = config.systemPrompt ?? defaultSystemPrompt;
  const toolsSchema = config.toolsSchema ?? [];
  const toolsFns = config.toolsFns ?? {};
  const errorFormater = config.errorFormater ?? defaultErrorFormater;

  const openAIAssistant = await openAIClient.beta.assistants.create({
    name: "pAIprog",
    model: "gpt-4-1106-preview",
    instructions: systemPrompt,
    tools: toolsSchema,
  });

  const executeFunctions = async (run: OpenAI.Beta.Threads.Runs.Run) => {
    if (!run.required_action) {
      throw new Error("Empty tool function to execute");
    }

    if (run.required_action.type !== "submit_tool_outputs") {
      throw new Error("Unsupported tool function, check your schema");
    }

    const toolCalls = run.required_action.submit_tool_outputs.tool_calls;

    const outputPromises = toolCalls.map((toolCall) => {
      if (toolCall.type !== "function") {
        return { success: false, error: "Unsupported tool call type" };
      }

      const functionName = toolCall.function.name as keyof typeof toolsSchema;

      const functionArguments = JSON.parse(toolCall.function.arguments);
      const fn = toolsFns[functionName as string];

      if (!fn)
        return {
          success: false,
          error: `Unsupported tool function ${functionName as string}`,
        };

      const output = fn(functionArguments).catch(errorFormater);

      return output;
    });

    const allOutputsPromise = Promise.all(outputPromises);

    const outputs = await allOutputsPromise;

    const toolsOutput = map(
      ([toolCall, output]) => {
        return {
          tool_call_id: toolCall.id,
          output: JSON.stringify(output ?? { success: true }),
        };
      },
      zip(toolCalls, outputs),
    );

    const isSuccess = outputs.every(
      (output) => !(output instanceof Object) || output.success,
    );

    return [toArray(toolsOutput), isSuccess] as const;
  }

  return {
    openAIAssistant,
    executeFunctions
  };
};

export type Assistant = PromiseValue<ReturnType<typeof createAssistant>>;

export type ThreadConfig = {
  openAIClient: OpenAI;
  assistant: Assistant;
}

export async function createThread(config: ThreadConfig) {
  const { assistant: defaultAssistant, openAIClient } = config;
  const openAIThread = await openAIClient.beta.threads.create({});

  async function* sendMessage(text: string, assistant?: Assistant) {
    let run: OpenAI.Beta.Threads.Runs.Run;
    let isInterrupted = false;

    const cancelRun = async () => {
      isInterrupted = true;
      if (!run) return;
      await openAIClient.beta.threads.runs.cancel(openAIThread.id, run.id).catch(() => {
        // Ignore error when trying to cancel a cancelled or completed run
      });
    };

    await openAIClient.beta.threads.messages.create(openAIThread.id, {
      role: "user",
      content: text,
    });

    const runAssistant = assistant ?? defaultAssistant;

    run = await openAIClient.beta.threads.runs.create(openAIThread.id, {
      assistant_id: runAssistant.openAIAssistant.id,
    });

    while (true) {
      if (
        run.status === "queued" ||
        run.status === "in_progress" ||
        run.status === "cancelling"
      ) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        yield { type: run.status };
        run = await openAIClient.beta.threads.runs.retrieve(openAIThread.id, run.id);
        continue;
      }

      if (run.status === "cancelled") {
        yield { type: "cancelled" as const };
        return;
      }

      if (run.status === "failed") {
        yield {
          type: "failed" as const,
          error: run.last_error?.message ?? "Unknown Error",
        };
        return;
      }

      if (run.status === "expired") {
        yield { type: "expired" as const };
        return;
      }

      if (run.status === "requires_action") {
        const toolsNames =
          run.required_action?.submit_tool_outputs.tool_calls.map(
            (tool) => tool.function.name,
          ) ?? [];
        yield { type: "executing_actions" as const, tools: toolsNames };
        try {
          const [tool_outputs, isSuccess] = await runAssistant.executeFunctions(run);
          const newRun = await openAIClient.beta.threads.runs.submitToolOutputs(
            openAIThread.id,
            run.id,
            { tool_outputs },
          );
          if (!isSuccess) yield { type: "executing_actions_failure" as const };
          run = newRun;
        } catch (error) {
          // Recover from error when trying to send tool outputs on a cancelled run
          if (isInterrupted) continue;
          throw error;
        }
      }

      if (run.status === "completed") {
        const messages = await openAIClient.beta.threads.messages.list(openAIThread.id);
        const lastMessage = messages.data[0].content[0];

        if (lastMessage.type === "text") {
          // TODO: add annotations
          yield { type: "completed" as const, message: lastMessage.text.value };
          return;
        }
      }
    }
  }

  return {
    openAIThread,
    sendMessage,
  };
}

export type Thread = PromiseValue<ReturnType<typeof createThread>>;
