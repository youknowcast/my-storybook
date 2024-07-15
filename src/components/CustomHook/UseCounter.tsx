import { useReducer } from "react";

export type StateProps = {
	count: number;
};

type ActionProps =
	| {
			type: "update";
			step: number;
	  }
	| {
			type: "reset";
			init: number;
	  };

type UseCounterReturn = [StateProps, () => void, () => void, () => void];

const useCounter = (init: number, step: number): UseCounterReturn => {
	const [state, dispatch] = useReducer(
		(state: StateProps, action: ActionProps) => {
			switch (action.type) {
				case "update":
					return { count: state.count + (action.step || step) };
				case "reset":
					return { count: action.init };
				default:
					return state;
			}
		},
		{ count: init },
	);

	const handleUp = () => dispatch({ type: "update", step });
	const handleDown = () => dispatch({ type: "update", step: -step });
	const handleReset = () => dispatch({ type: "reset", init });
	return [state, handleUp, handleDown, handleReset];
};
export default useCounter;
