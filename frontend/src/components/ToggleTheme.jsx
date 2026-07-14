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
      className={`control-ring flex h-9 w-16 items-center rounded-full p-1 shadow-inner transition-all duration-300 ease-in-out ${theme === "dark" ? "bg-slate-800" : "bg-gradient-to-r from-amber-400 to-orange-400"}`}
      title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
    >
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full shadow-md transition-all duration-300 ease-in-out ${theme === "dark" ? "translate-x-7 bg-slate-950 text-slate-100" : "translate-x-0 bg-white text-amber-500"}`}
      >
        {theme === "dark" ? <BsMoon size={14} /> : <BsSun size={14} />}
      </div>
    </button>
  );
};

export default ToggleTheme;
