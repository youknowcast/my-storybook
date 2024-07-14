import HookTimer from "../components/HookTimer";

export default {
  title: 'Example/HookTimer',
  component: HookTimer,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
  args: {
    init: 0,
  },
};

export const Default = {};
