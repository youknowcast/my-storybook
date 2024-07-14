import {forwardRef, useImperativeHandle, useRef} from "react";

type Props = {
  label: string;
}

export interface InputProps {
  focus: () => void;
}

const Input = forwardRef<InputProps, Props>((props :Props, ref) => {
  const { label } = props;
  const input = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => {
    return {
      focus() {
        input.current?.focus();
      }
    }
  }, [])

  return (
    <label>
      {label}:
      <input ref={input} type="text" size={15} />
    </label>
  )
})
export default Input;
