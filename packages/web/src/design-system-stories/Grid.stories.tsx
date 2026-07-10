import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Grid, Column, Tile } from "@carbon/react";

const meta: Meta<typeof Grid> = {
  title: "Grid",
  component: Grid,
};
export default meta;

type Story = StoryObj<typeof Grid>;

export const Default: Story = {
  render: () => (
    <Grid fullWidth>
      <Column lg={16} md={8} sm={4}>
        <Tile style={{ marginBottom: "1rem" }}>
          <h1>Welcome, Demo User</h1>
          <p style={{ color: "var(--cds-text-secondary)" }}>demo@example.com</p>
        </Tile>
      </Column>
      <Column lg={16} md={8} sm={4}>
        <Tile>
          <h3>Membership growth</h3>
        </Tile>
      </Column>
    </Grid>
  ),
};
