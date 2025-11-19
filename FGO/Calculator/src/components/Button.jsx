import { useState } from "react";

const Button = (props) => {
  const [count, setCount] = useState("Add Servant");

  return (
    <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      {props.label}
      {props.type}
    </button>
  );
};

export default Button;