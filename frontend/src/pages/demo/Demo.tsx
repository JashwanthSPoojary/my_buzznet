import { useState, useEffect } from "react";

 const Demo = () => {
  const [count, setCount] = useState(0);

  // Function recreated on every render
  const logCount = () => {
    console.log(count);
  };

  // useEffect runs on every render because logCount changes
  useEffect(() => {
    console.log("Effect triggered");
  }, [logCount]);

  return (
    <button onClick={() => setCount(count + 1)}>Increment</button>
  );
};

export default Demo;
