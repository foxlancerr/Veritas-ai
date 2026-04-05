import Notification from "../models/notification.model.js";

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
    await Notification.findOneAndDelete({
      _id: id,
      receiver: req.userId,
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
    await Notification.deleteMany({
      receiver: req.userId,
    });
    return res
      .status(200)
      .json({ message: "All notifications deleted successfully." });
  } catch (error) {
    console.error("Error deleting all notifications:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};
