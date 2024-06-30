import React from "react";
import './button.css'

type ButtonProps = {
  primary: boolean;
  backgroundColor: string;
  size: number;
  label: string;
  onClick: () => void;
};

export const Button = (props: ButtonProps) => {
  const { primary = false, backgroundColor, size = 'medium', label } = props;
  const mode = primary ? 'storybook-button--primary' : 'storybook-button--secondary';
  return (
    <button
      type="button"
      className={['storybook-button', `storybook-button--${size}`, mode].join(' ')}
      style={backgroundColor ? { backgroundColor } : undefined}
      {...props}
    >
      {label}
    </button>
  );
};
