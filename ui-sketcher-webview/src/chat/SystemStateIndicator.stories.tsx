import { Meta, StoryObj } from "@storybook/react";

import { StateIndicator } from "./SystemStateIndicator";

const meta: Meta<typeof StateIndicator> = {
  component: StateIndicator,
};

export default meta;
type Story = StoryObj<typeof StateIndicator>;

export const Thinking: Story = {
  args: {
    state: "thinking",
  },
};

export const Cancelled: Story = {
  args: {
    state: "cancelled",
  },
};

export const Cancelling: Story = {
  args: {
    state: "cancelling",
  },
};

export const Done: Story = {
  args: {
    state: "done",
  },
};

export const Expired: Story = {
  args: {
    state: "expired",
  },
};

export const Failed: Story = {
  args: {
    state: "failed",
  },
};
