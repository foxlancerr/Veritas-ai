import axios from "axios";

import io from "socket.io-client";
import { useContext, useEffect, useState } from "react";
import { UserDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { VITE_BACKEND_API_URL } from "../../api/url_helper";

const socket = io(VITE_BACKEND_API_URL.replace("/api", ""));

const ConnectionButton = ({ userId }) => {
  const { userData, setUserData } = useContext(UserDataContext);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- Send connection
  const handleSendConnection = async () => {
    try {
      setLoading(true);
      const result = await axios.post(
        `${VITE_BACKEND_API_URL}/connection/send/${userId}`,
        {},
        { withCredentials: true }
      );
      console.log(result);
      await handleGetStatus(); // Refresh status
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // --- Remove connection
  const handleRemoveConnection = async () => {
    try {
      setLoading(true);
      const result = await axios.delete(
        `${VITE_BACKEND_API_URL}/connection/remove/${userId}`,
        { withCredentials: true }
      );
      console.log(result);
      await handleGetStatus(); // Refresh status
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // --- Get current connection status
  const handleGetStatus = async () => {
    if (!userData?._id) return;
    try {
      const result = await axios.get(
        `${VITE_BACKEND_API_URL}/connection/get-status/${userId}`,
        { withCredentials: true }
      );
      setStatus(result.data.status);
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  };

  // --- Socket.io integration
  useEffect(() => {
    if (!userData?._id) return;

    socket.emit("register", userData._id);
    handleGetStatus();

    const handleStatusUpdate = ({ updatedUserId, newStatus }) => {
      if (updatedUserId === userId) {
        setStatus(newStatus);
      }
    };

    socket.on("statusUpdate", handleStatusUpdate);

    return () => {
      socket.off("statusUpdate", handleStatusUpdate);
    };
  }, [userId, userData?._id]);

  // --- Button click handler
  const handleClickbutton = async () => {
    if (status === "disconnect") {
      await handleRemoveConnection();
    } else if (status === "received") {
      navigate("/network");
    } else {
      await handleSendConnection();
    }
  };

  return (
    <button
      className="w-[120px] h-[42px] rounded-full border-2 cursor-pointer border-[#2dc0ff] text-[#2dc0ff] font-semibold hover:bg-[#2dc0ff] hover:text-white transition duration-300 ease-in-out shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={handleClickbutton}
      disabled={status === "pending" || loading}
    >
      {status || "Connect"}
    </button>
  );
};

export default ConnectionButton;
