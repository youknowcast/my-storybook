import {memo} from "react";

type ButtonProps = {
  id: string;
  handleClick: () => void;
  children: React.ReactNode;
}

const Button = memo((props: ButtonProps) => {
  const {id, handleClick, children} = props;

  console.log(`Button rendered id: ${id}`)

  return (
    <button key={id} onClick={handleClick}>{children}</button>
  )
});
export default Button;
