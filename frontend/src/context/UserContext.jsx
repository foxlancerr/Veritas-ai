import { useState, useEffect, createContext } from "react";
import { useAuthContext } from "./AuthContext";
import axios from "axios";
// import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
export const socket = io("http://localhost:8127");

// Context to import everywhere
export const UserDataContext = createContext();

const UserContextProvider = ({ children }) => {
  const [editProfile, setEditProfile] = useState(false);
  const [userData, setUserData] = useState(null);
  const serverURL = useAuthContext();
  const [allPostsData, setAllPostsData] = useState([]);
  const [profileData, setProfileData] = useState([]);

  // Fetch current user data
  const getCurrentUser = async () => {
    try {
      const res = await axios.get(
        `${serverURL.serverURL}/api/user/get-current-user`,
        {
          withCredentials: true,
        }
      );
      console.log(res.data.user);

      setUserData(res.data.user);
    } catch (error) {
      console.log("current user error:", error.message);
      setUserData(null); // fallback
    }
  };

  // Fetch all posts data
  const getAllPosts = async () => {
    try {
      const res = await axios.get(
        `${serverURL.serverURL}/api/post/get-all-posts`,
        {
          withCredentials: true,
        }
      );
      setAllPostsData(res.data.posts);
      return res.data.posts;
    } catch (error) {
      console.error("Error fetching posts:", error);
      return [];
    }
  };

  // get profile
  const handleGetProfile = async (userName, navigate) => {
    try {
      const result = await axios.get(
        `${serverURL.serverURL}/api/user/profile/${userName}`,
        {
          withCredentials: true,
        }
      );
      setProfileData(result.data.user);
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
