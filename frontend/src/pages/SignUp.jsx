import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { UserDataContext } from "../context/UserContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import ThemeChangeNavbar from "../components/ThemeChangeNavbar";
import { VITE_BACKEND_API_URL } from "../../api/url_helper";
import apiHelpers from "../../api/apiHelper";

const Signup = () => {
  const { getCurrentUser, getAllPosts } = useContext(UserDataContext);
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
      const result = await apiHelpers.post(`/auth/signup`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      toast.success("Signup successful!");
      resetForm();
      await getCurrentUser();
      await getAllPosts();
      navigate("/");
    } catch (err) {
      const message = err.response?.data?.message || "Signup failed!";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ThemeChangeNavbar />

      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#121212] px-4 pt-[80px] pb-10">
        <div className="bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg w-full max-w-md p-6">
          <h2 className="text-3xl font-bold text-center text-[#0A66C2] dark:text-[#2dc0ff] mb-6">
            Create Your Account
          </h2>

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
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A66C2] dark:focus:ring-[#2dc0ff] transition"
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
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A66C2] dark:focus:ring-[#2dc0ff] transition"
              />
              <span
                onClick={() => setShow((prev) => !prev)}
                className="absolute right-3 top-3 text-gray-500 dark:text-gray-300 cursor-pointer"
              >
                {show ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-md text-white font-semibold transition ${
                loading
                  ? "bg-blue-300 dark:bg-[#205d85] cursor-not-allowed"
                  : "bg-[#0A66C2] hover:bg-[#004182] dark:bg-[#2dc0ff] dark:hover:bg-[#22b4f2] dark:text-black"
              }`}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-sm mt-4 text-gray-700 dark:text-gray-400">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-[#0A66C2] hover:underline dark:text-[#2dc0ff] cursor-pointer font-medium"
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
