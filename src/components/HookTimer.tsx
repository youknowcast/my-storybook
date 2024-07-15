import { useEffect, useState } from "react";

const HookTimer = ({ init }: { init: number }) => {
	const [count, setCount] = useState(init);

	useEffect(() => {
		const t = setInterval(() => {
			setCount((c) => c - 1);
		}, 1000);
		return () => {
			clearInterval(t);
		};
	}, []);

	return <div className={count < 0 ? "warn" : ""}>現在のカウント: {count}</div>;
};
export default HookTimer;
