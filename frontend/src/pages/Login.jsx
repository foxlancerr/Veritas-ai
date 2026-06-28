import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import ThemeChangeNavbar from "../components/ThemeChangeNavbar";
import { useAuthContext } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
   const { login } = useAuthContext();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const resetForm = () => setFormData({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
     const response = await login(formData.email, formData.password);
   
      if (response.success) {
        toast.success("Login successful!");
        resetForm();
        navigate("/");
      }
    } catch (err) {
      console.log("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ThemeChangeNavbar />

      <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_38%),linear-gradient(135deg,_#f7f9ff_0%,_#eef4ff_45%,_#f9f7ff_100%)] px-4 pb-10 pt-[96px] dark:bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_38%),linear-gradient(135deg,_#020617_0%,_#0f172a_45%,_#030712_100%)]">
        <div className="auth-shell w-full max-w-md p-7 sm:p-8">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-sky-700 dark:text-sky-300">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Sign in to continue your professional journey.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="control-ring w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-sky-500 dark:focus:ring-sky-900/20"
            />

            <div className="relative">
              <input
                type={show ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="control-ring w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-16 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-sky-500 dark:focus:ring-sky-900/20"
              />
              <span
                onClick={() => setShow((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-sm font-medium text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                {show ? "Hide" : "Show"}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-full py-3 text-sm font-semibold text-white shadow-lg transition duration-300 ease-in-out ${
                loading
                  ? "cursor-not-allowed bg-sky-300"
                  : "bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500"
              }`}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
            Want to create an account?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="cursor-pointer font-semibold text-sky-700 hover:underline dark:text-sky-300"
            >
              Sign Up
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
