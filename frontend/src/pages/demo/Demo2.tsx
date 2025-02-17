import { useState, useEffect, useCallback } from "react";

const Demo2 = () => {
  const [count, setCount] = useState(0);

  // Memoized function: Only recreated when `count` changes
  const logCount = useCallback(() => {
    console.log(count);
  }, [count]);

  // useEffect now only runs when logCount changes (i.e., when `count` changes)
  useEffect(() => {
    console.log("Effect triggered");
  }, [logCount]);

  return (
    <button onClick={() => setCount(count + 1)}>Increment</button>
  );
};

export default Demo2;
