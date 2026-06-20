import { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import emptyDp from "../assets/emptyDp.jpg";
import { FaUserCheck, FaUserTimes, FaUserMinus } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import { MdPersonSearch } from "react-icons/md";
import apiHelpers from "../../api/apiHelper";
import { socket, UserDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/notificationContext";

const Network = () => {
  const { userData, handleGetProfile } = useContext(UserDataContext);
  const [invitations, setInvitations] = useState([]);
  const [myConnections, setMyConnections] = useState([]);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [loadingConns, setLoadingConns] = useState(true);
  const [activeTab, setActiveTab] = useState("invitations"); // "invitations" | "connections"
  const navigate = useNavigate();
  const { fetchNotifications } = useNotification();

  // ── Fetch pending invitations ──────────────────────────────────────────────
  const fetchInvitations = async () => {
    try {
      setLoadingInvites(true);
      const result = await apiHelpers.get(`/connection/requests`, {
        withCredentials: true,
      });
      setInvitations(result.request || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingInvites(false);
    }
  };

  // ── Fetch accepted connections ─────────────────────────────────────────────
  const fetchConnections = async () => {
    try {
      setLoadingConns(true);
      const result = await apiHelpers.get(`/connection/`, {
        withCredentials: true,
      });
      setMyConnections(result.connections || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingConns(false);
    }
  };

  // ── Accept invitation ──────────────────────────────────────────────────────
  const handleAcceptConnection = async (requestId) => {
    try {
      await apiHelpers.put(
        `/connection/accept/${requestId}`,
        {},
        { withCredentials: true }
      );
      // Remove from invitations, refresh connections list
      setInvitations((prev) => prev.filter((c) => c._id !== requestId));
      fetchConnections();
      fetchNotifications(); 
    } catch (error) {
      console.log(error);
    }
  };

  // ── Ignore / reject invitation ─────────────────────────────────────────────
  const handleRejectConnection = async (requestId) => {
    try {
      await apiHelpers.put(
        `/connection/reject/${requestId}`,
        {},
        { withCredentials: true }
      );
      setInvitations((prev) => prev.filter((c) => c._id !== requestId));
    } catch (error) {
      console.log(error);
    }
  };

  // ── Remove an existing connection ─────────────────────────────────────────
  const handleRemoveConnection = async (userId) => {
    try {
      await apiHelpers.delete(`/connection/remove/${userId}`, {
        withCredentials: true,
      });
      setMyConnections((prev) => prev.filter((c) => c._id !== userId));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchInvitations();
    fetchConnections();
  }, []);

  // ── Real-time: new connection request arrives ──────────────────────────────
  useEffect(() => {
    const handleNewNotification = (notification) => {
      if (notification.type === "connectionRequest") {
        fetchInvitations();
      }
    };
    socket.on("newNotification", handleNewNotification);
    return () => socket.off("newNotification", handleNewNotification);
  }, []);

  return (
    <div className="w-screen min-h-screen bg-[#f0efe7] dark:bg-[#0f0f0f] pt-[90px] px-4 sm:px-6 lg:px-8 transition-all duration-300">
      <Navbar />

      <div className="max-w-[960px] mx-auto mt-6 flex flex-col gap-6">

        {/* ── Tab bar ── */}
        <div className="flex gap-2 bg-white dark:bg-[#1a1a1a] rounded-2xl p-2 shadow border border-gray-200 dark:border-gray-700 w-fit">
          <button
            onClick={() => setActiveTab("invitations")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === "invitations"
                ? "bg-[#18c5ff] text-white shadow"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
            }`}
          >
            <FaUserCheck className="w-4 h-4" />
            Invitations
            {invitations.length > 0 && (
              <span className="ml-1 bg-white text-[#18c5ff] dark:bg-[#18c5ff] dark:text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                {invitations.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("connections")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === "connections"
                ? "bg-[#18c5ff] text-white shadow"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
            }`}
          >
            <FiUsers className="w-4 h-4" />
            My Connections
            {myConnections.length > 0 && (
              <span className="ml-1 bg-white text-[#18c5ff] dark:bg-[#18c5ff] dark:text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                {myConnections.length}
              </span>
            )}
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* INVITATIONS TAB                                                    */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "invitations" && (
          <>
            {loadingInvites ? (
              <div className="w-full bg-white dark:bg-[#1a1a1a] rounded-2xl shadow p-8 text-center text-gray-400 animate-pulse border border-gray-200 dark:border-gray-700">
                Loading invitations…
              </div>
            ) : invitations.length === 0 ? (
              <div className="w-full bg-white dark:bg-[#1a1a1a] rounded-2xl shadow p-10 flex flex-col items-center gap-3 text-gray-400 border border-gray-200 dark:border-gray-700">
                <MdPersonSearch className="w-12 h-12" />
                <p className="text-base font-medium">No pending invitations</p>
                <p className="text-sm">When someone sends you a request it will appear here.</p>
              </div>
            ) : (
              <div className="w-full bg-white dark:bg-[#1a1a1a] rounded-2xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                {invitations.map((connection, index) => (
                  <div
                    key={connection._id}
                    className={`flex justify-between items-center px-6 py-5 transition hover:bg-gray-50 dark:hover:bg-[#222] ${
                      index !== invitations.length - 1
                        ? "border-b border-gray-100 dark:border-gray-700"
                        : ""
                    }`}
                  >
                    {/* Profile */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 shadow flex-shrink-0">
                        <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-black">
                          <img
                            className="w-full h-full object-cover"
                            src={connection.sender.profileImage || emptyDp}
                            alt="profile"
                          />
                        </div>
                      </div>
                      <div>
                        <h2
                          className="text-base font-semibold text-gray-800 dark:text-white hover:underline cursor-pointer"
                          onClick={() =>
                            handleGetProfile(connection.sender.userName, navigate)
                          }
                        >
                          {connection.sender.firstName}{" "}
                          {connection.sender.lastName}
                        </h2>
                        {connection.sender.headline && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                            {connection.sender.headline}
                          </p>
                        )}
                        <p className="text-xs text-[#18c5ff] mt-0.5 font-medium">
                          Wants to connect with you
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleAcceptConnection(connection._id)}
                        className="flex items-center gap-1.5 bg-[#18c5ff] text-white px-4 py-2 rounded-full hover:bg-[#11a9dd] transition text-sm font-semibold shadow"
                      >
                        <FaUserCheck className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectConnection(connection._id)}
                        className="flex items-center gap-1.5 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#333] transition text-sm font-semibold"
                      >
                        <FaUserTimes className="w-4 h-4" />
                        Ignore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* MY CONNECTIONS TAB                                                 */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "connections" && (
          <>
            {loadingConns ? (
              <div className="w-full bg-white dark:bg-[#1a1a1a] rounded-2xl shadow p-8 text-center text-gray-400 animate-pulse border border-gray-200 dark:border-gray-700">
                Loading connections…
              </div>
            ) : myConnections.length === 0 ? (
              <div className="w-full bg-white dark:bg-[#1a1a1a] rounded-2xl shadow p-10 flex flex-col items-center gap-3 text-gray-400 border border-gray-200 dark:border-gray-700">
                <FiUsers className="w-12 h-12" />
                <p className="text-base font-medium">No connections yet</p>
                <p className="text-sm">
                  Accept invitations or send requests to grow your network.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myConnections.map((conn) => (
                  <div
                    key={conn._id}
                    className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow border border-gray-200 dark:border-gray-700 flex flex-col items-center p-5 gap-3 transition hover:shadow-md"
                  >
                    {/* Avatar */}
                    <div
                      className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 shadow-lg cursor-pointer"
                      onClick={() => handleGetProfile(conn.userName, navigate)}
                    >
                      <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-black">
                        <img
                          src={conn.profileImage || emptyDp}
                          alt={conn.firstName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="text-center">
                      <h3
                        className="font-semibold text-gray-800 dark:text-white hover:underline cursor-pointer"
                        onClick={() =>
                          handleGetProfile(conn.userName, navigate)
                        }
                      >
                        {conn.firstName} {conn.lastName}
                      </h3>
                      {conn.headline && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                          {conn.headline}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-1 w-full">
                      <button
                        onClick={() =>
                          handleGetProfile(conn.userName, navigate)
                        }
                        className="flex-1 text-center text-sm font-medium text-[#18c5ff] border border-[#18c5ff] rounded-full py-1.5 hover:bg-[#e8f9ff] dark:hover:bg-[#0d2f38] transition"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => handleRemoveConnection(conn._id)}
                        className="flex items-center justify-center gap-1 text-sm font-medium text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-full px-3 py-1.5 hover:bg-red-50 dark:hover:bg-[#3a1f1f] hover:text-red-500 hover:border-red-300 transition"
                        title="Remove connection"
                      >
                        <FaUserMinus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Network;
