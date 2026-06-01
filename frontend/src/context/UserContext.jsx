import { useState, useEffect, createContext } from "react";
import axios from "axios";
// import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { VITE_BACKEND_WEB_SOCKET_URI } from "../../api/url_helper";
import apiHelpers from "../../api/apiHelper";

// Single shared authenticated socket — does NOT auto-connect until we have a token
export const socket = io(VITE_BACKEND_WEB_SOCKET_URI, {
  auth: { token: localStorage.getItem("token") || "" },
  autoConnect: false,
});

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

  // Connect the socket and keep userSocketMap current on every reconnect
  useEffect(() => {
    if (!userData?._id) return;

    const userId = userData._id;

    // Re-register on every (re)connect so the server map always has the latest socket.id
    const onConnect = () => {
      socket.emit("register", userId);
    };

    socket.auth = { token: localStorage.getItem("token") };
    socket.on("connect", onConnect);

    if (socket.connected) {
      socket.emit("register", userId);
    } else {
      socket.connect();
    }

    // Do NOT disconnect here — would cause constant reconnect churn (confirmed in backend logs)
    return () => {
      socket.off("connect", onConnect);
    };
  }, [userData?._id]);

  // Real-time feed: prepend new posts as they are created by any user
  useEffect(() => {
    const handleNewPost = (post) => {
      setAllPostsData((prev) => {
        // Guard against duplicates (e.g. creator receives their own socket event)
        if (prev.some((p) => p._id?.toString() === post._id?.toString()))
          return prev;
        return [post, ...prev];
      });
    };

    socket.on("newPost", handleNewPost);
    return () => socket.off("newPost", handleNewPost);
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
