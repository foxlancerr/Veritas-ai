import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import emptyDp from "../assets/emptyDp.jpg";
import { RxCross2 } from "react-icons/rx";

import { MdOutlineNotificationsActive } from "react-icons/md";
import { FaBellSlash } from "react-icons/fa";
import { BsTrash3Fill } from "react-icons/bs";
import { VITE_BACKEND_API_URL } from "../../api/url_helper";
import apiHelpers from "../../api/apiHelper";

const Notification = () => {
  const [notificationData, setNotificationData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const result = await apiHelpers.get(`/notification/get-notifications`, {
        withCredentials: true,
      });
      setNotificationData(result.notification);
      console.log("Fetched notifications:", result.notification);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete single notification
  const handleDeleteNotification = async (id) => {
    try {
      const result = await apiHelpers.delete(`/notification/delete-single/${id}`, {
        withCredentials: true,
      });
    
      setNotificationData((prev) => prev.filter((notify) => notify._id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Clear all notifications
  const handleClearAllNotification = async () => {
    try {
      const result =  await apiHelpers.delete(`/notification/delete-all`, {
        withCredentials: true,
      });
     
      setNotificationData([]);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  // Generate message based on type
  const getMessage = (type) => {
    switch (type) {
      case "like":
        return "liked your post";
      case "comment":
        return "commented on your post";
      default:
        return "accepted your request";
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="w-screen min-h-screen bg-[#f0efe7] dark:bg-[#0f0f0f] pt-[100px] px-4 transition-all duration-300">
      <Navbar />

      {/* Header */}
      <div className="w-full max-w-[1000px] mx-auto mt-5 bg-white dark:bg-[#1c1c1c] shadow-lg rounded-xl flex items-center justify-between px-6 py-5 text-gray-800 dark:text-gray-100 text-xl font-semibold border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <MdOutlineNotificationsActive className="w-7 h-7 text-blue-500" />
          <span>Notifications ({notificationData.length})</span>
        </div>
        {notificationData.length > 0 && (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-800 transition text-sm font-medium"
            onClick={handleClearAllNotification}
          >
            <BsTrash3Fill className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Loading / No Notifications */}
      {loading ? (
        <div className="w-full text-center mt-10 text-gray-500 dark:text-gray-400 text-lg animate-pulse">
          Loading...
        </div>
      ) : notificationData.length === 0 ? (
        <div className="w-full text-center mt-10 text-gray-500 dark:text-gray-400 text-lg flex flex-col items-center gap-3">
          <FaBellSlash className="w-10 h-10 text-gray-400" />
          No Notifications
        </div>
      ) : (
        <div className="w-full max-w-[1000px] mx-auto mt-6 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {notificationData.map((notify) => (
            <div
              key={notify._id}
              className="flex justify-between items-start bg-white dark:bg-[#1c1c1c] p-5 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 transition-all"
            >
              {/* Notification content */}
              <div className="flex gap-4">
                {/* Profile image */}
                {notify.relatedUser?.profileImage && (
                  <img
                    src={notify.relatedUser.profileImage || emptyDp}
                    alt="User DP"
                    className="w-14 h-14 rounded-full object-cover border border-gray-300 dark:border-gray-600"
                  />
                )}

                {/* Message and post */}
                <div className="text-gray-800 dark:text-gray-100">
                  <div className="font-semibold text-base sm:text-lg">
                    {notify.relatedUser?.firstName || "Someone"}{" "}
                    {notify.relatedUser?.lastName || ""}
                    <span className="font-normal text-gray-600 dark:text-gray-400">
                      {" "}
                      {getMessage(notify.type)}
                    </span>
                  </div>

                  {notify.relatedPost &&
                    (notify.relatedPost.image ||
                      notify.relatedPost.description) && (
                      <div className="flex items-center gap-3 mt-2 ml-1">
                        {notify.relatedPost.image && (
                          <img
                            src={notify.relatedPost.image}
                            alt="Post"
                            className="w-[80px] h-[60px] object-cover rounded border border-gray-300 dark:border-gray-600"
                          />
                        )}
                        {notify.relatedPost.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 max-w-[300px]">
                            {notify.relatedPost.description}
                          </p>
                        )}
                      </div>
                    )}
                </div>
              </div>

              {/* Dismiss button */}
              <button
                onClick={() => handleDeleteNotification(notify._id)}
                className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition"
              >
                <RxCross2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notification;
