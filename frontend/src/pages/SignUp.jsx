import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import ThemeChangeNavbar from "../components/ThemeChangeNavbar";
import apiHelpers from "../../api/apiHelper";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    password: "",
  });

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      userName: "",
      email: "",
      password: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiHelpers.post(`/auth/signup`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      toast.success("Signup successful!");
      resetForm();
      navigate("/");
    } catch (err) {
      console.log("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ThemeChangeNavbar />

      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_38%),linear-gradient(135deg,_#f7f9ff_0%,_#eef4ff_45%,_#f9f7ff_100%)] px-4 pb-10 pt-[96px] dark:bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_38%),linear-gradient(135deg,_#020617_0%,_#0f172a_45%,_#030712_100%)]">
        <div className="auth-shell w-full max-w-md p-7 sm:p-8">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-sky-700 dark:text-sky-300">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Join the community and start connecting today.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {["firstName", "lastName", "userName", "email"].map((field) => (
              <input
                key={field}
                type={field === "email" ? "email" : "text"}
                name={field}
                placeholder={
                  field.charAt(0).toUpperCase() +
                  field.slice(1).replace("Name", " Name")
                }
                value={formData[field]}
                onChange={handleChange}
                required
                className="control-ring w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-sky-500 dark:focus:ring-sky-900/20"
              />
            ))}

            <div className="relative">
              <input
                type={show ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="control-ring w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-14 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-sky-500 dark:focus:ring-sky-900/20"
              />
              <span
                onClick={() => setShow((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                {show ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-full py-3 text-sm font-semibold text-white shadow-lg transition ${
                loading
                  ? "cursor-not-allowed bg-sky-300"
                  : "bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500"
              }`}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="cursor-pointer font-semibold text-sky-700 hover:underline dark:text-sky-300"
            >
              Sign In
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default Signup;
