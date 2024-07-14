import {useRef, useState} from "react";

const HookRef = () => {
  // ReturnType で setInverval の戻り値を infer する
  // cf. type ReturnType<T> = T extends ((...args: any) => infer R) ? R : any
  const id = useRef<ReturnType<typeof setInterval> | null>(null);
  const [count, setCount] = useState(0);

  const handleStart = () => {
    if (id.current === null) {
      id.current = setInterval(() => setCount(c => c + 1), 1000);
    }
  }
  const handleEnd = () => {
    if (id.current !== null) {
      clearInterval(id.current);
      id.current = null;
    }
  }
  const handleClear = () => {
    setCount(0);
  }

  return (
    <>
      <button onClick={handleStart}>start</button>
      <button onClick={handleEnd}>end</button>
      <button onClick={handleClear}>clear</button>
      <p>{count} sec 経過</p>
    </>
  )
}
export default HookRef;
