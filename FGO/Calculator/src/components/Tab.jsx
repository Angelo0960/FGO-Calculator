import { useState } from "react";
import Forms from "./form.jsx";
import Button from "./Button.jsx";
const Tabs = (props) => {   // <-- FIX: receives props, not tabs directly
  const [value, setValue] = useState(0);

  return (
    <div className="bg-gray-300 box-shadow-lg p-10 m-10 rounded-3xl border-t-2 border-t-gray-200 shadow-lg shadow-gray-200">
      {/* Tabs */}
      <div>
        <div
          role="tablist"
          className="flex space-x-4 justify-center"
        >
          <button
            role="tab"
            aria-selected={value === 0}
            onClick={() => setValue(0)}
            className={`py-2 px-4 text-sm font-medium 
              ${
                value === 0
                  ? "border bg-white border-white text-black rounded-xl"
                  : "text-black hover:text-black"
              }`}
          >
            My Servants
          </button>

          <button
            role="tab"
            aria-selected={value === 1}
            onClick={() => setValue(1)}
            className={`py-2 px-4 text-sm font-medium 
              ${
                value === 1
                  ? "border bg-white border-white text-black rounded-xl"
                  : "text-black hover:text-black"
              }`}
          >
            Item Two
          </button>

          <button
            role="tab"
            aria-selected={value === 2}
            onClick={() => setValue(2)}
            className={`py-2 px-4 text-sm font-medium 
              ${
                value === 2
                  ? "border bg-white border-white text-black rounded-xl"
                  : "text-black hover:text-black"
              }`}
          >
            Item Three
          </button>

          <button
            role="tab"
            aria-selected={value === 3}
            onClick={() => setValue(3)}
            className={`py-2 px-4 text-sm font-medium 
              ${
                value === 3
                  ? "border bg-white border-white text-black rounded-xl"
                  : "text-black hover:text-black"
              }`}
          >
            Item Four
          </button>
        </div>
      </div>

      {/* Panels */}
      <div>
        {value === 0 && <div className="p-4">
          <Forms />
          <Button label="Add Servant" className="text-right"/>
          </div>}
        {value === 1 && <div className="p-4"><Forms /></div>}
        {value === 2 && <div className="p-4"><Forms /></div>}
        {value === 3 && <div className="p-4"><Forms /></div>}
      </div>

    </div>
  );
};

export default Tabs;
