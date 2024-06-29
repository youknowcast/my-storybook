// src/DnDExample.stories.tsx
import DnD from '../components/Dnd';
import {Meta, StoryObj} from "@storybook/react";

const meta: Meta = {
  title: 'Example/DnD',
  component: DnD,
};

type Story = StoryObj<typeof DnD>;

export const Basic: Story = {};

export const WithProp: Story = {
  render: () => <DnD />,
};
export default meta;
