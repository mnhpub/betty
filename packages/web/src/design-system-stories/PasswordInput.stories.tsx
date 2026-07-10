import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PasswordInput } from "@carbon/react";

const meta: Meta<typeof PasswordInput> = {
  title: "PasswordInput",
  component: PasswordInput,
};
export default meta;

type Story = StoryObj<typeof PasswordInput>;

export const Default: Story = {
  args: { id: "password", labelText: "Password" },
};
