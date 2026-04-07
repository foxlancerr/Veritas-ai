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

      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-black pt-[80px] px-4">
        <div className="bg-white dark:bg-[#1f1f1f] shadow-xl rounded-lg w-full max-w-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-semibold text-center text-[#0A66C2] dark:text-[#2dc0ff] mb-6">
            Join LinkedHub
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md bg-white dark:bg-black dark:text-white dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] dark:focus:ring-[#2dc0ff]"
            />

            <div className="relative">
              <input
                type={show ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md bg-white dark:bg-black dark:text-white dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] dark:focus:ring-[#2dc0ff]"
              />
              <span
                onClick={() => setShow((prev) => !prev)}
                className="absolute right-3 top-2.5 text-sm text-gray-500 dark:text-gray-300 cursor-pointer"
              >
                {show ? "Hide" : "Show"}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-md text-white font-semibold transition duration-300 ease-in-out ${
                loading
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-[#0A66C2] hover:bg-[#004182]"
              }`}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm mt-4 text-gray-600 dark:text-gray-300">
            Want to create an account?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="text-[#0A66C2] hover:underline cursor-pointer font-medium dark:text-[#2dc0ff]"
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
