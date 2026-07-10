import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@carbon/react";

const meta: Meta<typeof Button> = {
  title: "Button",
  component: Button,
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: { kind: "primary", children: "Log in" },
};

export const Tertiary: Story = {
  args: { kind: "tertiary", children: "Try the demo" },
};

export const Danger: Story = {
  args: { kind: "danger", children: "Delete group" },
};
