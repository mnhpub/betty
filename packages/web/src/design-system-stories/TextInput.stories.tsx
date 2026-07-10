import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TextInput } from "@carbon/react";

const meta: Meta<typeof TextInput> = {
  title: "TextInput",
  component: TextInput,
};
export default meta;

type Story = StoryObj<typeof TextInput>;

export const Default: Story = {
  args: { id: "email", labelText: "Email", type: "email" },
};

export const Invalid: Story = {
  args: {
    id: "email-invalid",
    labelText: "Email",
    type: "email",
    invalid: true,
    invalidText: "Invalid email or password",
  },
};
