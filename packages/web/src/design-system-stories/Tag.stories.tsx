import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Tag } from "@carbon/react";

const meta: Meta<typeof Tag> = {
  title: "Tag",
  component: Tag,
};
export default meta;

type Story = StoryObj<typeof Tag>;

export const Active: Story = {
  args: { type: "green", children: "active" },
};

export const Waitlist: Story = {
  args: { type: "cyan", children: "waitlist" },
};

export const Archived: Story = {
  args: { type: "gray", children: "archived" },
};
