import { useState, useEffect, createContext } from "react";
import axios from "axios";
// import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { VITE_BACKEND_API_URL } from "../../api/url_helper";
import apiHelpers from "../../api/apiHelper";
export const socket = io(VITE_BACKEND_API_URL.replace("/api", ""));

// Context to import everywhere
export const UserDataContext = createContext();

const UserContextProvider = ({ children }) => {
  const [editProfile, setEditProfile] = useState(false);
  const [userData, setUserData] = useState(null);
  const [allPostsData, setAllPostsData] = useState([]);
  const [profileData, setProfileData] = useState([]);

  // Fetch current user data
  const getCurrentUser = async () => {
    try {
      const res = await apiHelpers.get(`/user/get-current-user`, {
        withCredentials: true,
      });

      setUserData(res.user);
    } catch (error) {
      console.log("current user error:", error.message);
      setUserData(null); // fallback
    }
  };

  // Fetch all posts data
  const getAllPosts = async () => {
    try {
      const res = await apiHelpers.get(`/post/get-all-posts`, {
        withCredentials: true,
      });
      setAllPostsData(res.posts);
      return res.posts;
    } catch (error) {
      console.error("Error fetching posts:", error);
      return [];
    }
  };

  // get profile
  const handleGetProfile = async (userName, navigate) => {
    try {
      const result = await apiHelpers.get(`/user/profile/${userName}`, {
        withCredentials: true,
      });
      setProfileData(result.user);
      console.log(userName, "is called");

      //  const navigate = useNavigate()
      navigate("/profile");
    } catch (error) {
      console.log("Error fetching profile:", error);
      return null;
    }
  };
  useEffect(() => {
    getCurrentUser();
    getAllPosts();
  }, []);

  const value = {
    userData,
    setUserData,
    getCurrentUser,
    editProfile,
    setEditProfile,
    allPostsData,
    setAllPostsData,
    getAllPosts,
    profileData,
    setProfileData,
    handleGetProfile,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};

export default UserContextProvider;
