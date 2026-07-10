import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Stack, Button, TextInput, Tile } from "@carbon/react";

const meta: Meta<typeof Stack> = {
  title: "Stack",
  component: Stack,
};
export default meta;

type Story = StoryObj<typeof Stack>;

export const Vertical: Story = {
  render: () => (
    <Tile style={{ maxWidth: "20rem" }}>
      <Stack gap={5}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Log in to Betty</h1>
        <TextInput id="stack-email" labelText="Email" type="email" />
        <Button type="submit">Log in</Button>
      </Stack>
    </Tile>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <Stack gap={4} orientation="horizontal">
      <Button>Log in</Button>
      <Button kind="tertiary">Sign up</Button>
    </Stack>
  ),
};
