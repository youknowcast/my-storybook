import CustomHook from "../components/CustomHook";

export default {
  title: 'Example/CustomHook',
  component: CustomHook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
  args: {
  },
};

export const Default = {};

export const MultipleInstances = () => (
  <div>
    <CustomHook />
    <CustomHook />
    <CustomHook />
  </div>
);
