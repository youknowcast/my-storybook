import { useEffect, useRef } from "react";
import Input, { type InputProps } from "./Input";

const HookImperativeHandle = () => {
	const text = useRef<InputProps>(null);
	useEffect(() => {
		text.current?.focus();
	}, []);

	return (
		<>
			<Input label="サンプル" ref={text} />
			<p>表示時に input にフォーカスがあたります</p>
		</>
	);
};
export default HookImperativeHandle;
