import { Meta, StoryObj } from "@storybook/react";

import { ToolsStep } from "./ToolsStep";

const meta: Meta<typeof ToolsStep> = {
  component: ToolsStep,
};

export default meta;
type Story = StoryObj<typeof ToolsStep>;

export const Running: Story = {
  args: {
    index: 1,
    step: {
      type: "tools",
      status: "running",
      tools: [
        {
          id: "1",
          name: "tool 1",
          args: { test: "test 1" },
        },
        {
          id: "2",
          name: "tool 2",
          args: { test: "test 2" },
        },
        {
          id: "3",
          name: "tool 3",
          args: { test: "test 3" },
        },
      ],
    },
  },
};

export const Done: Story = {
  args: {
    index: 1,
    step: {
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
        {
          id: "2",
          status: "error",
          name: "tool 2",
          args: { test: "test 2" },
          output: { error: "error" },
        },
        {
          id: "3",
          status: "success",
          name: "tool 3",
          args: { test: "test 3" },
          output: { success: true },
        },
      ],
    },
  },
};
