import {useMemo, useState} from "react";
import Button from './Button';
import Counter from "./Counter";

const sleep = (delay: number) => {
  const start = Date.now();
  while (Date.now() - start < delay);
}

const Component = () => {
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);

  const increment = () => setCount1((c) => c + 1);
  const decrement = () => setCount2((c) => c - 1);

  // btn1 と btn2 で，btn1 のみ heavyProcess 実行を伴うという前提をおきます．
  // useMemo しない場合，rendering 時に常に heavyProcess が実行されるため，
  // btn1, btn2 どちらを押下したときも動作が重くなります．
  // これを回避するために useMemo で関数のメモ化を行っています．
  const heavyProcess = useMemo(() => {
    sleep(1000);
    return count1 + 100;
  }, [count1]);

  return (
    <>
      <div>
        <Button id='btn1' handleClick={increment}>カウントアップ</Button>
        <Counter id='c1' value={count1} />
        {heavyProcess}
      </div>
      <div>
        <Button id='id2' handleClick={decrement}>カウントダウン</Button>
        <Counter id='c2' value={count2} />
      </div>
    </>
  )
}
export default Component;
