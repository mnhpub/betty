import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { InlineNotification } from "@carbon/react";

const meta: Meta<typeof InlineNotification> = {
  title: "InlineNotification",
  component: InlineNotification,
};
export default meta;

type Story = StoryObj<typeof InlineNotification>;

export const Error: Story = {
  args: {
    kind: "error",
    title: "invalid email or password",
    hideCloseButton: true,
    lowContrast: true,
  },
};

export const Success: Story = {
  args: {
    kind: "success",
    title: "Account created",
    hideCloseButton: true,
    lowContrast: true,
  },
};
