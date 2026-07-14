import { useContext, useEffect, useState } from "react";
import { socket, UserDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import apiHelpers from "../../api/apiHelper";

const ConnectionButton = ({ userId }) => {
  const { userData } = useContext(UserDataContext);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendConnection = async () => {
    try {
      setLoading(true);
      await apiHelpers.post(`/connection/send/${userId}`, {}, { withCredentials: true });
      await handleGetStatus();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveConnection = async () => {
    try {
      setLoading(true);
      await apiHelpers.delete(`/connection/remove/${userId}`, { withCredentials: true });
      await handleGetStatus();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStatus = async () => {
    if (!userData?._id) return;
    try {
      const result = await apiHelpers.get(`/connection/get-status/${userId}`, { withCredentials: true });
      setStatus(result.status);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!userData?._id) return;

    handleGetStatus();

    const handleStatusUpdate = ({ updatedUserId, newStatus }) => {
      if (updatedUserId.toString() === userId.toString()) {
        setStatus(newStatus);
      }
    };

    socket.on("statusUpdate", handleStatusUpdate);

    return () => {
      socket.off("statusUpdate", handleStatusUpdate);
    };
  }, [userId, userData?._id]);

  const handleClickbutton = async () => {
    if (status === "disconnect") {
      await handleRemoveConnection();
    } else if (status === "received") {
      navigate("/network");
    } else {
      await handleSendConnection();
    }
  };

  const buttonVariant =
    status === "disconnect"
      ? "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300"
      : status === "received"
      ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300"
      : status === "pending"
      ? "border-slate-300 bg-slate-100 text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400"
      : "border-sky-500/70 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-500/50 dark:bg-sky-500/10 dark:text-sky-300";

  return (
    <button
      className={`control-ring h-[42px] w-[120px] rounded-full border px-3 py-2 text-sm font-semibold shadow-sm transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50 ${buttonVariant}`}
      onClick={handleClickbutton}
      disabled={status === "pending" || loading}
    >
      {status || "Connect"}
    </button>
  );
};

export default ConnectionButton;
