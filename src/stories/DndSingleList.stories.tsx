// src/DnDExample.stories.tsx
import {Meta, StoryObj} from "@storybook/react";
import DnDSingleList from "../components/DndSingleList";

const meta: Meta = {
  title: 'Example/DnDSingleList',
  component: DnDSingleList,
};

type Story = StoryObj<typeof DnDSingleList>;

export const Basic: Story = {};

export const WithProp: Story = {
  render: () => <DnDSingleList />,
};
export default meta;
