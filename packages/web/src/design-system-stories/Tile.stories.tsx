import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Tile } from "@carbon/react";

const meta: Meta<typeof Tile> = {
  title: "Tile",
  component: Tile,
};
export default meta;

type Story = StoryObj<typeof Tile>;

export const Default: Story = {
  render: () => (
    <Tile style={{ maxWidth: "20rem" }}>
      <h3 style={{ marginBottom: "0.5rem" }}>Membership growth</h3>
      <p style={{ color: "var(--cds-text-secondary)" }}>Active members by group type</p>
    </Tile>
  ),
};
