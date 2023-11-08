import OpenAI from "openai";

type UITransformerConfig =
  | {
      apiKey: string;
      onChunk?: (chunk: string) => void;
      libraries: string[];
      preCode: string;
      postCode: string;
    }
  | {
      apiKey: string;
      onChunk?: (chunk: string) => void;
      libraries: string[];
      preCode?: null;
      postCode?: null;
    };

const uiToComponent = async (
  base64Image: string,
  { apiKey, libraries: [], onChunk }: UITransformerConfig
) => {
  const client = new OpenAI({ apiKey });
  const response = await client.chat.completions.create({
    model: "gpt-4-vision-preview",
    stream: true,
    messages: [
      {
        role: "system",
        content: "",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Turn this image into the frontend code implementation",
          },
          {
            type: "image_url",
            image_url: {
              url: "data:image/png;base64," + base64Image,
            },
          },
        ],
      },
    ],
  });

  let output = "";

  for await (const chunk of response) {
    if (chunk.choices.length === 0 || !chunk.choices[0].delta.content) continue;

    const textChunk = chunk.choices[0].delta.content;
    output += textChunk;
    if (onChunk) onChunk(textChunk);
  }

  return output;
};
