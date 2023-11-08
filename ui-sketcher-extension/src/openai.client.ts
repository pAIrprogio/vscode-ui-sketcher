import OpenAI from "openai";

type UITransformerConfig =
  | {
      apiKey: string;
      onChunk?: (chunk: string) => Promise<void>;
      libraries?: string[];
      preCode: string;
      postCode: string;
    }
  | {
      apiKey: string;
      onChunk?: (chunk: string) => Promise<void>;
      libraries?: string[];
      preCode?: null;
      postCode?: null;
    };

export const uiToComponent = async (
  base64Image: string,
  { apiKey, libraries = [], onChunk }: UITransformerConfig,
) => {
  const client = new OpenAI({ apiKey });
  const response = await client.chat.completions.create({
    model: "gpt-4-vision-preview",
    stream: true,
    max_tokens: 2000,
    messages: [
      {
        role: "system",
        content: `You are an expert frontend developer.
Your task is to integrate mockups into html.
Only respond with an html code block.
`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Turn this image into the html using tailwind",
          },
          {
            type: "image_url",
            image_url: {
              url: base64Image,
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
    if (onChunk) await onChunk(textChunk);
  }

  return output;
};
