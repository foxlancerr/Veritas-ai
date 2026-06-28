import logo2 from "../assets/logo2.png";
import emptyDp from "../assets/emptyDp.jpg";
import { IoNotificationsSharp, IoSearchSharp } from "react-icons/io5";
import { FaUserGroup } from "react-icons/fa6";
import { TiHome } from "react-icons/ti";
import { FiMessageCircle } from "react-icons/fi";
import { useContext, useEffect, useRef, useState } from "react";

import { socket, UserDataContext } from "../context/UserContext";
import { Link, useLocation, useNavigate } from "react-router-dom";

import ToggleTheme from "./ToggleTheme";
import apiHelpers from "../../api/apiHelper";
import { useAuthContext } from "../context/AuthContext";
import Chatbot from "./Chatbot";
import { useNotification } from "../context/notificationContext";

const Navbar = () => {
  const { userData, handleGetProfile } = useContext(UserDataContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [searchData, setSearchData] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const { logout: handleLogout } = useAuthContext();
  const { notificationCount, fetchNotifications } = useNotification();
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

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <>
    <nav className="w-full fixed top-0 left-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950/95">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 px-3 py-3 md:px-6">
        <div
          className="flex min-w-0 flex-1 items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img
            src={logo2}
            alt="logo"
            className="w-10 h-10 shrink-0 rounded-2xl object-contain"
          />

          <div className="relative flex-1 min-w-0">
            <form className="flex w-full items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-sm shadow-sm transition duration-300 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-200 dark:border-slate-800 dark:bg-slate-900 dark:focus-within:border-sky-500 dark:focus-within:ring-sky-900/30">
              <IoSearchSharp className="text-slate-500 dark:text-slate-400" />
              <input
                type="text"
                placeholder="Search"
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none"
                onChange={(e) => setSearchInput(e.target.value)}
                value={searchInput}
              />
            </form>

            {searchData.length > 0 && (
              <div className="absolute top-full left-0 z-50 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-950 mt-2 max-h-96 overflow-y-auto">
                {searchData.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-3 px-4 py-3 transition duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer border-b border-slate-200 last:border-b-0 dark:border-slate-700"
                    onClick={() => {
                      handleGetProfile(user.userName, navigate);
                      setSearchInput("");
                      setSearchData([]);
                    }}
                  >
                    <img
                      src={user.profileImage || emptyDp}
                      alt="dp"
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div className="min-w-0">
                      <span className="block truncate font-medium text-sm text-slate-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                        @{user.userName}
                      </span>
                      {user.headline && (
                        <span className="block truncate text-xs text-slate-600 dark:text-slate-400">
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

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div
            className={`hidden sm:flex flex-col items-center justify-center rounded-full px-3 py-2 text-sm transition duration-200 ${
              currentPath === "/"
                ? "text-sky-600 font-semibold"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            }`}
            onClick={() => navigate("/")}
          >
            <TiHome className="text-2xl" />
            <span className="text-xs hidden md:block">Home</span>
          </div>

          <div
            className={`hidden lg:flex flex-col items-center justify-center rounded-full px-3 py-2 text-sm transition duration-200 ${
              currentPath === "/network"
                ? "text-sky-600 font-semibold"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            }`}
            onClick={() => navigate("/network")}
          >
            <FaUserGroup className="text-xl" />
            <span className="text-xs">My Network</span>
          </div>

          <div
            className={`flex flex-col items-center justify-center rounded-full px-3 py-2 text-sm transition duration-200 ${
              currentPath === "/messages"
                ? "text-sky-600 font-semibold"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            }`}
            onClick={() => navigate("/messages")}
          >
            <FiMessageCircle className="text-2xl" />
            <span className="text-xs hidden md:block">Messages</span>
          </div>

          <div
            className={`flex flex-col items-center justify-center rounded-full px-3 py-2 text-sm transition duration-200 ${
              currentPath === "/notifications"
                ? "text-sky-600 font-semibold"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            }`}
            onClick={() => navigate("/notifications")}
          >
            <div className="relative">
              <IoNotificationsSharp className="text-2xl" />
              {notificationCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-[3px]">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </div>
            <span className="text-xs hidden md:block">Notifications</span>
          </div>

          <div className="relative" ref={dropdownRef}>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 p-[2px] shadow-md cursor-pointer transition duration-200 hover:scale-[1.02]"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="h-full w-full overflow-hidden rounded-full bg-white">
                <img
                  src={userData?.profileImage || emptyDp}
                  alt="Profile"
                  className="h-full w-full object-cover rounded-full"
                />
              </div>
            </div>

            {showDropdown && (
              <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-950 z-50 px-5 py-4">
                <div className="flex flex-col items-center">
                  <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 p-[2px]">
                    <div className="h-full w-full overflow-hidden rounded-full bg-white">
                      <img
                        src={userData?.profileImage || emptyDp}
                        alt="Profile"
                        className="h-full w-full object-cover rounded-full"
                      />
                    </div>
                  </div>
                  <h1 className="mb-3 text-center text-base font-semibold text-slate-900 dark:text-white">
                    {`${userData?.firstName} ${userData?.lastName}`}
                  </h1>
                  <button
                    onClick={() => handleGetProfile(userData?.userName, navigate)}
                    className="w-full rounded-full border border-sky-500 px-4 py-2 text-sm font-medium text-sky-600 transition duration-200 hover:bg-sky-50 dark:border-sky-500 dark:text-sky-300 dark:hover:bg-slate-900"
                  >
                    View Profile
                  </button>
                </div>

                <hr className="my-5 border-slate-200 dark:border-slate-700" />

                <button
                  onClick={() => navigate("/network")}
                  className="w-full flex items-center gap-3 rounded-xl px-4 py-2 text-sm text-slate-700 transition duration-200 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <FaUserGroup className="text-lg" />
                  <span>My Network</span>
                </button>

                <Link
                  to={'/login'}
                  onClick={handleLogout}
                  className="mt-4 block w-full rounded-full border border-rose-500 px-4 py-2 text-center text-sm font-medium text-rose-600 transition duration-200 hover:bg-rose-50 dark:hover:bg-slate-900"
                >
                  Sign Out
                </Link>
              </div>
            )}
          </div>

          <ToggleTheme />
        </div>
      </div>

    </nav>
      <Chatbot></Chatbot>
    </>
  );
};

export default Navbar;
