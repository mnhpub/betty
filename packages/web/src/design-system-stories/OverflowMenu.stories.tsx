import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { OverflowMenu, OverflowMenuItem } from "@carbon/react";

const meta: Meta<typeof OverflowMenu> = {
  title: "OverflowMenu",
  component: OverflowMenu,
};
export default meta;

type Story = StoryObj<typeof OverflowMenu>;

export const Default: Story = {
  args: {
    "aria-label": "Change language",
    iconDescription: "Change language",
    size: "lg",
    open: true,
    children: [
      <OverflowMenuItem key="en" itemText="English" />,
      <OverflowMenuItem key="es" itemText="Español" />,
    ],
  },
};
