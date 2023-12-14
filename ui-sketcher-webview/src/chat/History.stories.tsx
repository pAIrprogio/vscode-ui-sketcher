import { Meta, StoryObj } from "@storybook/react";

import { History } from "./History";

const meta: Meta<typeof History> = {
  component: History,
};

export default meta;
type Story = StoryObj<typeof History>;

export const Running: Story = {
  args: {
    history: [
      {
        id: "1",
        role: "user",
        content: `### Hello I need to create a new file

\`\`\`json
{
  "test": "test"
}
\`\`\``,
      },
      {
        id: "2",
        role: "system",
        state: "thinking",
        steps: [
          {
            type: "tools",
            status: "running",
            tools: [
              {
                id: "1",
                name: "tool 1",
                args: { test: "test 1" },
              },
            ],
          },
        ],
      },
    ],
  },
};

export const Fixing: Story = {
  args: {
    history: [
      {
        id: "1",
        role: "user",
        content: "Hello I need to create a new file",
      },
      {
        id: "2",
        role: "system",
        state: "thinking",
        steps: [
          {
            type: "tools",
            status: "done",
            tools: [
              {
                id: "1",
                status: "error",
                name: "tool 1",
                args: { test: "test 1" },
                output: { error: "error" },
              },
            ],
          },
          {
            type: "tools",
            status: "running",
            tools: [
              {
                id: "1",
                name: "tool 1",
                args: { test: "test 1" },
              },
            ],
          },
        ],
      },
    ],
  },
};

export const Done: Story = {
  args: {
    history: [
      {
        id: "1",
        role: "user",
        content: "Hello World",
      },
      {
        id: "2",
        role: "system",
        state: "done",
        steps: [
          {
            type: "tools",
            status: "done",
            tools: [
              {
                id: "1",
                status: "success",
                name: "tool 1",
                args: { test: "test 1" },
                output: { success: true },
              },
            ],
          },
          {
            type: "message",
            content: `I've create a new file for you using:

- Test
- List

\`\`\`bash
touch file.json
\`\`\`
`,
          },
        ],
      },
    ],
  },
};
