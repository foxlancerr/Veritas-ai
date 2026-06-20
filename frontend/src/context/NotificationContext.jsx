import React from "react";
import { createContext, useState, useEffect } from "react";
import apiHelpers from "../../api/apiHelper";
import { socket } from "../context/UserContext";

// Context to import everywhere
const NotificationContext = createContext();

export const NotificationContextProvider = ({ children }) => {
  const [notificationData, setNotificationData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();

    // Prepend newly arriving notifications in real-time
    const handleNew = (notification) => {
      setNotificationData((prev) => {
        // Avoid duplicates (e.g. if the REST fetch and socket race)
        if (
          prev.some((n) => n._id?.toString() === notification._id?.toString())
        )
          return prev;
        return [notification, ...prev];
      });
    };

    // Remove a notification that was resolved externally (e.g. request accepted in /network)
    const handleDeleted = ({ notificationId }) => {
      setNotificationData((prev) =>
        prev.filter((n) => n._id?.toString() !== notificationId?.toString()),
      );
    };

    socket.on("newNotification", handleNew);
    socket.on("notificationDeleted", handleDeleted);

    return () => {
      socket.off("newNotification", handleNew);
      socket.off("notificationDeleted", handleDeleted);
    };
  }, []);

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
      const result = await apiHelpers.delete(
        `/notification/delete-single/${id}`,
        {
          withCredentials: true,
        },
      );

      setNotificationData((prev) => prev.filter((notify) => notify._id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Clear all notifications
  const handleClearAllNotification = async () => {
    try {
      const result = await apiHelpers.delete(`/notification/delete-all`, {
        withCredentials: true,
      });

      setNotificationData([]);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const value = {
    notificationData,
    loading,
    fetchNotifications,
    handleDeleteNotification,
    handleClearAllNotification,
    notificationCount: notificationData.length || 0,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => React.useContext(NotificationContext);
