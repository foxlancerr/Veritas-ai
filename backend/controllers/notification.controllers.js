import { io } from "../index.js";
import { getUserRoom } from "../config/socket.js";
import Notification from "../models/notification.model.js";

// Helper: create a notification and return it fully populated for socket emit
export const createAndPopulateNotification = async (data) => {
  const doc = await Notification.create(data);
  return Notification.findById(doc._id)
    .populate("relatedUser", "firstName lastName profileImage")
    .populate("relatedPost", "image description");
};

// getting notifications
export const getNotifications = async (req, res) => {
  try {
    const notification = await Notification.find({ receiver: req.userId })
      .populate("relatedUser", "firstName lastName profileImage")
      .populate("relatedPost", "image description");
    return res
      .status(200)
      .json({ message: "Notifications retrieved successfully.", notification });
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notificationDeleted = await Notification.findOneAndDelete({
      _id: id,
      receiver: req.userId,
    });

    if (!notificationDeleted) {
      return res.status(404).json({ message: "Notification not found." });
    }

    io.to(getUserRoom(req.userId)).emit("notificationDeleted", {
      notificationId: id,
    });

    return res
      .status(200)
      .json({ message: "Notification deleted successfully." });
  } catch (error) {
    console.error("Error deleting notification:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// delete all notifications
export const clearAllNotification = async (req, res) => {
  try {
    const clearedNotifications = await Notification.deleteMany({
      receiver: req.userId,
    });

    if (!clearedNotifications) {
      return res
        .status(404)
        .json({ message: "No notifications found to delete." });
    }

 
    io.to(getUserRoom(req.userId)).emit("notificationCleared");
    return res
      .status(200)
      .json({ message: "All notifications deleted successfully." });
  } catch (error) {
    console.error("Error deleting all notifications:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};
