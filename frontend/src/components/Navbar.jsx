import logo2 from "../assets/logo2.png";
import emptyDp from "../assets/emptyDp.jpg";
import { IoNotificationsSharp, IoSearchSharp } from "react-icons/io5";
import { FaUserGroup } from "react-icons/fa6";
import { TiHome } from "react-icons/ti";
import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { UserDataContext } from "../context/UserContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import ToggleTheme from "./ToggleTheme";
import { VITE_BACKEND_API_URL } from "../../api/url_helper";
import apiHelpers from "../../api/apiHelper";

const Navbar = () => {
  const { userData, handleGetProfile } = useContext(UserDataContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [searchData, setSearchData] = useState([]);
  const location = useLocation();
  const currentPath = location.pathname;
  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await apiHelpers.get(`/auth/logout`, {
      withCredentials: true,
    });

    toast.success("Logout successful");
    // Clear user data from context
    userData(null);
  };

  const handleSearch = async () => {
    try {
      const result = await apiHelpers.get(`/user/search?query=${searchInput}`, {
        withCredentials: true,
      });
      setSearchData(result.users);
      console.log(result.users);
    } catch (error) {
      console.error("Error searching user:", error);
  
    }
  };

  // calling the search
  useEffect(() => {
    if (searchInput.length > 0) {
      handleSearch();
    } else {
      setSearchData([]);
    }
  }, [searchInput]);
  return (
    <nav className="w-full h-[70px] bg-white dark:bg-[#1e1e1e] fixed top-0 shadow-md dark:shadow-sm z-50 flex items-center justify-between md:justify-around px-4 md:px-8 transition-colors duration-300">
      {/* Left: Logo + Search */}
      <div
        className="flex items-center gap-4 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <img
          src={logo2}
          alt="logo"
          className="w-[40px] h-[40px] object-contain"
        />

        <div className="relative ">
          <form className="flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            <IoSearchSharp className="text-gray-500 dark:text-gray-300 mr-2" />
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent outline-none w-40 lg:w-64 text-sm text-gray-800 dark:text-white placeholder:text-gray-400"
              onChange={(e) => setSearchInput(e.target.value)}
              value={searchInput}
            />
          </form>

          {searchData.length > 0 && (
            <div className="absolute top-full left-0 w-full bg-white dark:bg-[#2c2c2c] border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg mt-2 z-50 max-h-96 overflow-y-auto">
              {searchData.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer border-b border-gray-300 dark:border-gray-600"
                  onClick={() => {
                    handleGetProfile(user.userName, navigate);
                    setSearchInput("");
                    setSearchData([]);
                  }}
                >
                  <img
                    src={user.profileImage || emptyDp}
                    alt="dp"
                    className="w-10 h-10 rounded-full object-cover border border-gray-300"
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-sm text-gray-800 dark:text-white">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="text-xs text-gray-500">
                      @{user.userName}
                    </span>
                    {user.headline && (
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        {user.headline}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Icons & Profile */}
      <div className="flex items-center gap-4 sm:gap-6 relative">
        {/* Home */}
        <div
          className={`hidden sm:flex flex-col items-center cursor-pointer text-sm ${
            currentPath === "/"
              ? "text-[#18c5ff] font-bold"
              : "text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white"
          }`}
          onClick={() => navigate("/")}
        >
          <TiHome className="text-2xl" />
          <span className="text-xs hidden md:block">Home</span>
        </div>

        {/* Network */}
        <div
          className={`hidden lg:flex flex-col items-center cursor-pointer text-sm ${
            currentPath === "/network"
              ? "text-[#18c5ff] font-bold"
              : "text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white"
          }`}
          onClick={() => navigate("/network")}
        >
          <FaUserGroup className="text-xl" />
          <span className="text-xs">My Network</span>
        </div>

        {/* Notifications */}
        <div
          className={`flex flex-col items-center cursor-pointer text-sm ${
            currentPath === "/notifications"
              ? "text-[#18c5ff] font-bold"
              : "text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white"
          }`}
          onClick={() => navigate("/notifications")}
        >
          <IoNotificationsSharp className="text-2xl" />
          <span className="text-xs hidden md:block">Notifications</span>
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 p-[2px] shadow-md cursor-pointer"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-white">
              <img
                src={userData.profileImage || emptyDp}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>

          {showDropdown && (
            <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-[#2c2c2c] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 px-5 py-4">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 p-[2px] mb-3">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white">
                    <img
                      src={userData.profileImage || emptyDp}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </div>
                <h1 className="font-semibold text-base text-center mb-3 text-gray-800 dark:text-white">
                  {`${userData.firstName} ${userData.lastName}`}
                </h1>
                <button
                  onClick={() => handleGetProfile(userData.userName, navigate)}
                  className="w-full text-[#2dc0ff] border border-[#2dc0ff] px-4 py-2 rounded-full font-medium hover:bg-blue-50 dark:hover:bg-[#1c3a4b] transition text-sm"
                >
                  View Profile
                </button>
              </div>

              <hr className="my-5 border-gray-200 dark:border-gray-600" />

              <button
                onClick={() => navigate("/network")}
                className="w-full flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 text-sm rounded-md transition"
              >
                <FaUserGroup className="text-lg" />
                <span>My Network</span>
              </button>

              <Link
                to={"/login"}
                onClick={handleLogout}
                className="w-full text-center block mt-4 text-[#ec4545] border border-[#ec4545] px-4 py-2 rounded-full font-medium hover:bg-red-50 dark:hover:bg-[#4a1f1f] transition text-sm"
              >
                Sign Out
              </Link>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <ToggleTheme />
      </div>
    </nav>
  );
};

export default Navbar;
