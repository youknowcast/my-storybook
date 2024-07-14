import useCounter from "./UseCounter";

const HookCustom = () => {
  const [state, handleUp, handleDown, handleReset] = useCounter(0, 1);
  return (
    <div>
      <button onClick={handleUp}>カウントアップ</button>
      <button onClick={handleDown}>カウントダウン</button>
      <button onClick={handleReset}>Reset</button>
      <p>{state.count}</p>
    </div>
  )
}
export default HookCustom;
