import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import emptyDp from "../assets/emptyDp.jpg";
import { FaUserCheck, FaUserTimes } from "react-icons/fa";

import axios from "axios";
import { useAuthContext } from "../context/AuthContext";

const Network = () => {
  const [connections, setConnections] = useState([]);
  const { serverURL } = useAuthContext();

  //   handling get request
  const handleGetRequests = async () => {
    try {
      const result = await axios.get(`${serverURL}/api/connection/requests`, {
        withCredentials: true,
      });
      setConnections(result.data.request);
      console.log("connection ", result);
    } catch (error) {
      console.log(error);
    }
  };

  //   handle accept connection
  const handleAcceptConnection = async (requestId) => {
    try {
      const result = await axios.put(
        `${serverURL}/api/connection/accept/${requestId}`,
        {},
        {
          withCredentials: true,
        }
      );
      console.log(result);
      setConnections(connections.filter((con) => con._id !== requestId));
    } catch (error) {
      console.log(error);
    }
  };

  //   handle reject connection
  const handleRejectConnection = async (requestId) => {
    try {
      const result = await axios.put(
        `${serverURL}/api/connection/reject/${requestId}`,
        {},
        {
          withCredentials: true,
        }
      );
      console.log(result);
      setConnections(connections.filter((con) => con._id !== requestId));
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    handleGetRequests();
  }, []);
  return (
    <div className="w-screen min-h-screen bg-[#f0efe7] dark:bg-gradient-to-br dark:from-[#0f0f0f] dark:to-black pt-[100px] px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-10 transition-all duration-300">
      <Navbar />

      {/* Invitations Header */}
      <div className="w-full max-w-[900px] bg-white dark:bg-[#1a1a1a] shadow-xl rounded-2xl flex items-center justify-between p-6 text-xl font-semibold text-gray-700 dark:text-gray-100 border border-gray-200 dark:border-gray-700">
        <span>Connection Invitations</span>
        <span className="text-[#18c5ff] bg-blue-100 dark:bg-blue-950 px-4 py-1 rounded-full text-sm font-medium">
          {connections.length} Pending
        </span>
      </div>

      {/* Invitations List */}
      {connections.length > 0 ? (
        <div className="w-full max-w-[900px] shadow-xl rounded-2xl bg-white dark:bg-[#1a1a1a] p-6 flex flex-col gap-5 border border-gray-200 dark:border-gray-700 transition-all duration-300">
          {connections.map((connection, index) => (
            <div
              key={index}
              className="w-full flex justify-between items-center p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-all duration-200"
            >
              {/* Left: User Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 shadow-lg">
                  <div className="w-full h-full rounded-full overflow-hidden cursor-pointer bg-white dark:bg-black">
                    <img
                      className="w-full h-full object-cover"
                      src={connection.sender.profileImage || emptyDp}
                      alt="profile"
                    />
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {`${connection.sender.firstName} ${connection.sender.lastName}`}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Wants to connect with you
                  </p>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-3">
                <button
                  title="Accept Connection"
                  className="flex items-center gap-2 bg-[#18c5ff] text-white px-4 py-2 rounded-full hover:bg-[#11a9dd] transition text-sm font-medium shadow-md"
                  onClick={() => handleAcceptConnection(connection._id)}
                >
                  <FaUserCheck className="w-5 h-5" />
                  Accept
                </button>
                <button
                  title="Ignore Request"
                  className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition text-sm font-medium shadow-md"
                  onClick={() => handleRejectConnection(connection._id)}
                >
                  <FaUserTimes className="w-5 h-5" />
                  Ignore
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full max-w-[900px] bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg p-6 text-center text-gray-500 dark:text-gray-400">
          You have no pending connection invitations.
        </div>
      )}
    </div>
  );
};

export default Network;
