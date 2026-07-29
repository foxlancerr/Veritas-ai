import { Link } from "react-router-dom";
import { FiHome } from "react-icons/fi";
import { RiErrorWarningLine } from "react-icons/ri";
import Navbar from "../components/Navbar";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_35%),linear-gradient(135deg,_#f7f9ff_0%,_#eef4ff_45%,_#f8f5ff_100%)] px-6 dark:bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.14),_transparent_35%),linear-gradient(135deg,_#020617_0%,_#0f172a_45%,_#030712_100%)]">
      <div className="glass-panel flex max-w-xl flex-col items-center rounded-[32px] px-8 py-12 text-center shadow-2xl">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg">
          <RiErrorWarningLine className="text-5xl" />
        </div>

        <h2 className="text-7xl font-extrabold tracking-tight bg-gradient-to-r from-sky-600 to-violet-600 bg-clip-text text-transparent">
          404
        </h2>

        <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
          Page Not Found
        </h1>

        <p className="mt-4 max-w-md text-slate-600 dark:text-slate-400">
          Sorry, the page you're looking for doesn't exist, may have been
          removed, or the URL is incorrect.
        </p>

        <Link
          onClick={() => window.history.back()}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-600 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
        >
          <FiHome />
          Go Back
        </Link>
      </div>
    </main>
  );
}
