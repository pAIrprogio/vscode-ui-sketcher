import { Meta, StoryObj } from "@storybook/react";

import { Chat } from "./Chat";

const meta: Meta<typeof Chat> = {
  component: Chat,
};

export default meta;
type Story = StoryObj<typeof Chat>;

export const Primary: Story = {};
