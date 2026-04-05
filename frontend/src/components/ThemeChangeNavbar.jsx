import ToggleTheme from "./ToggleTheme";
import { FaLinkedin } from "react-icons/fa";
import logo from "../../public/logo.svg";

const ThemeChangeNavbar = () => {
  return (
    <nav className="w-full fixed top-0 left-0 z-50 bg-white dark:bg-[#1f1f1f] border-b border-gray-300 dark:border-gray-700 shadow-md px-6 py-3 flex items-center justify-between">
      {/* Logo + Title */}
      <div className="flex items-center gap-3">
        <img src={logo} alt="Logo" className="w-[100px]  object-contain" />
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-[#0A66C2] dark:text-white">
            LinkedIn Clone
          </h1>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Developed by Muhammad Sahil
          </span>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-6">
        <div className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block">
          Visit my profile to connect with the developer
        </div>
        <a
          href="https://www.linkedin.com/in/codingbysahil"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-full border border-[#0A66C2] text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white dark:border-[#2dc0ff] dark:text-[#2dc0ff] dark:hover:bg-[#2dc0ff] dark:hover:text-black transition-all duration-300"
        >
          <FaLinkedin className="w-5 h-5" />
          <span className="hidden sm:inline text-sm font-medium">
            My Profile
          </span>
        </a>
        <ToggleTheme />
      </div>
    </nav>
  );
};

export default ThemeChangeNavbar;
