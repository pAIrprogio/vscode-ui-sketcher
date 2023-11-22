import OpenAI from "openai";
import {
  ChatCompletionContentPart,
  ChatCompletionMessageParam,
} from "openai/resources";
import { systemPrompt } from "./openai.prompts";

type UITransformerConfig = {
  apiKey: string;
  base64Image: string;
  imageTexts?: string | null;
  maxTokens: number;
  onChunk?: (chunk: string) => Promise<void>;
  stack?: string;
  customInstructions?: string | null;
  filePath: string;
  fileContent?: string | null;
};

const START_QUOTE_REGEX = /```[^\n]*\n/;
const PARTIAL_END_QUOTE = /\n`{0,3}$/;
const FULL_END_QUOTE_REGEX = /\n```/;
const REMOVE_PREFIX_REGEX = /.*```[^\n]*\n/s;
const REMOVE_SUFFIX_REGEX = /\n```.*/s;

export const uiToComponent = async ({
  base64Image,
  imageTexts,
  apiKey,
  stack,
  onChunk,
  maxTokens,
  customInstructions = "",
  filePath,
  fileContent,
}: UITransformerConfig) => {
  const client = new OpenAI({ apiKey });
  const messages: ChatCompletionMessageParam[] = [];

  // SYSTEM PROMPT

  messages.push({
    role: "system",
    content: customInstructions
      ? systemPrompt + "\n\n" + customInstructions
      : systemPrompt,
  });

  // USER PROMPT

  const userMessageParts: ChatCompletionContentPart[] = [];

  userMessageParts.push({
    type: "image_url",
    image_url: {
      url: base64Image,
      detail: "high",
    },
  });

  userMessageParts.push({
    type: "text",
    text: "Turn these wireframes into code",
  });

  if (imageTexts && imageTexts.length > 0)
    userMessageParts.push({
      type: "text",
      text: "The wireframes text is: \n" + imageTexts,
    });
  else
    userMessageParts.push({
      type: "text",
      text: "The text could be extracted from the wireframes.",
    });

  if (stack && stack.length > 0)
    userMessageParts.push({
      type: "text",
      text: "The project's stack is: " + stack,
    });

  userMessageParts.push({
    type: "text",
    text: "The file path is: " + filePath,
  });

  if (fileContent && fileContent.length > 0) {
    userMessageParts.push({
      type: "text",
      text: "The current file content is: \n```\n" + fileContent + "\n```",
    });
  } else {
    userMessageParts.push({
      type: "text",
      text: "The file is currently empty.",
    });
  }

  messages.push({
    role: "user",
    content: userMessageParts,
  });

  const response = await client.chat.completions.create({
    model: "gpt-4-vision-preview",
    stream: true,
    max_tokens: maxTokens,
    messages: messages,
  });

  // #region BUFFER
  let buffer = "";
  let output = "";
  let hasCodeStarted = false;

  for await (const chunk of response) {
    if (chunk.choices.length === 0 || !chunk.choices[0].delta.content) continue;

    const textChunk = chunk.choices[0].delta.content;

    buffer += textChunk;

    // We want to strip everything but the code
    if (!hasCodeStarted) {
      hasCodeStarted = START_QUOTE_REGEX.test(buffer);

      if (!hasCodeStarted) continue;

      buffer = buffer.replace(REMOVE_PREFIX_REGEX, "");
    }

    // Stop at full end quote
    if (FULL_END_QUOTE_REGEX.test(buffer)) {
      const code = buffer.replace(REMOVE_SUFFIX_REGEX, "");
      if (code !== "") {
        output += code;
        if (onChunk) await onChunk(code);
      }
      break;
    }

    // Buffer if not a full end quote, but a partial one
    if (PARTIAL_END_QUOTE.test(buffer)) {
      const parts = buffer.split("\n");
      buffer = "\n" + parts.pop() || "";
      const code = parts.join("\n");
      if (code !== "") {
        output += code;
        if (onChunk) await onChunk(code);
      }
      continue;
    }

    // Skip empty buffer
    if (buffer === "") continue;

    // Dump buffer
    output += buffer;
    if (onChunk) await onChunk(buffer);
    buffer = "";
  }
  // #endregion

  return output;
};
