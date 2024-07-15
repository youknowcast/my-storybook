type CounterProps = {
	id: string;
	value: number;
};

const Counter = (props: CounterProps) => {
	const { id, value } = props;

	console.log(`Counter is rendered id: ${id}`);

	return <p>現在値: {value}</p>;
};
export default Counter;
