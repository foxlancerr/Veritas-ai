import ToggleTheme from "./ToggleTheme";
import { FaLinkedin } from "react-icons/fa";
import logo from "../../public/logo.svg";

const ThemeChangeNavbar = () => {
  return (
    <nav className="w-full fixed top-0 left-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950/95">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/5 dark:bg-slate-100/10">
            <img src={logo} alt="Logo" className="w-8 h-8 sm:w-9 sm:h-9 object-contain" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold tracking-tight text-slate-900 dark:text-white sm:text-lg">
              SmartConnect AI System
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Developed by Muhammad Sahil
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <p className="hidden sm:block text-sm text-slate-600 dark:text-slate-300">
            Visit my profile to connect with the developer
          </p>
          <a
            href="https://www.linkedin.com/in/codingbysahil"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-sky-600 bg-white px-3.5 py-2 text-sm font-medium text-sky-600 shadow-sm transition duration-300 hover:bg-sky-50 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-slate-900 dark:text-sky-300 dark:border-sky-500 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <FaLinkedin className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-medium">My Profile</span>
          </a>
          <ToggleTheme />
        </div>
      </div>
    </nav>
  );
};

export default ThemeChangeNavbar;
