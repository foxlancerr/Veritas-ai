import { useEffect, useState } from "react";
import { BsSun, BsMoon } from "react-icons/bs";

const ToggleTheme = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <button
      onClick={toggleTheme}
      className={`w-14 h-8 flex items-center rounded-full p-1 transition-all duration-300 ease-in-out
        ${theme === "dark" ? "bg-gray-700" : "bg-yellow-400"}`}
      title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
    >
      <div
        className={`w-6 h-6 rounded-full shadow-md transform transition-all duration-300 ease-in-out flex items-center justify-center text-white
        ${theme === "dark" ? "translate-x-6 bg-gray-900" : "translate-x-0 bg-white text-yellow-500"}`}
      >
        {theme === "dark" ? <BsMoon size={16} /> : <BsSun size={16} />}
      </div>
    </button>
  );
};

export default ToggleTheme;
