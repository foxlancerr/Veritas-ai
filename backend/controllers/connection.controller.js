import Connection from "../models/connection.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

import { io } from "../index.js";
import { getUserRoom } from "../config/socket.js";
import { createAndPopulateNotification } from "./notification.controllers.js";
import { MAX_LIMIT_PER_DAY } from "../constant/index.js";

// send connection request
export const sendConnection = async (req, res) => {
  try {
    const { id } = req.params;
    const sender = req.userId;

    const user = await User.findById(sender);

    // Prevent self connection
    if (sender == id) {
      return res.status(400).json({
        message: "You cannot send a connection request to yourself.",
      });
    }

    // Already connected
    if (user.connection.includes(id)) {
      return res.status(400).json({
        message: "You are already connected.",
      });
    }

    
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayConnections = await Connection.countDocuments({
      sender,
      status: { $in: ["pending", "accepted"] },
      createdAt: { $gte: startOfDay },
    });

    if (todayConnections >= MAX_LIMIT_PER_DAY) {
      return res.status(429).json({
        message:
          `You have reached your daily connection request limit of ${MAX_LIMIT_PER_DAY}.`,
      });
    }

    // Existing pending request
    const existingConnection = await Connection.findOne({
      sender,
      receiver: id,
      status: "pending",
    });

    if (existingConnection) {
      return res.status(400).json({
        message: "Connection request already exists.",
      });
    }

    // Create request
    const newRequest = await Connection.create({
      sender,
      receiver: id,
    });

    // Persist notification and populate before socket emit
    const notification = await createAndPopulateNotification({
      receiver: id,
      type: "connectionRequest",
      relatedUser: sender,
    });

    // Socket — real-time updates
    const receiverRoom = getUserRoom(id.toString());
    const senderRoom = getUserRoom(sender.toString());

    io.to(receiverRoom).emit("statusUpdate", {
      updatedUserId: sender,
      newStatus: "received",
    });

    io.to(receiverRoom).emit("newNotification", notification);

    io.to(senderRoom).emit("statusUpdate", {
      updatedUserId: id,
      newStatus: "pending",
    });

    return res.status(200).json({
      message: "Connection request sent successfully.",
      newRequest,
      remainingLimit: MAX_LIMIT_PER_DAY - (todayConnections + 1),
    });
  } catch (error) {
    console.error("Error sending connection request:", error);

    return res.status(500).json({
      message: "Send connection error",
      error: error.message,
    });
  }
};

// accept connection request
export const acceptConnection = async (req, res) => {
  try {
    const { connectionId } = req.params;

    // Populate so .sender and .receiver are ObjectId-friendly strings, not raw refs
    const connection = await Connection.findById(connectionId)
      .populate("sender", "_id")
      .populate("receiver", "_id");

    if (!connection) {
      return res.status(404).json({ message: "Connection request not found." });
    }
    if (connection.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Connection request already processed." });
    }

    const senderId = connection.sender._id.toString();
    const receiverId = connection.receiver._id.toString();

    connection.status = "accepted";
    await connection.save();

    // Add each user to the other's connection list
    await User.findByIdAndUpdate(req.userId, {
      $addToSet: { connection: senderId },
    });
    await User.findByIdAndUpdate(senderId, {
      $addToSet: { connection: req.userId },
    });

    // Notify the original sender that their request was accepted (populated for socket)
    const notification = await createAndPopulateNotification({
      receiver: senderId,
      type: "connectionAccepted",
      relatedUser: req.userId,
    });

    // Delete the stale connectionRequest notification for the acceptor (receiverId)
    const staleNotif = await Notification.findOneAndDelete({
      receiver: receiverId,
      relatedUser: senderId,
      type: "connectionRequest",
    });

    // Socket — real-time updates
    const receiverRoom = getUserRoom(receiverId);
    const senderRoom = getUserRoom(senderId);

    io.to(receiverRoom).emit("statusUpdate", {
      updatedUserId: senderId,
      newStatus: "disconnect",
    });
    if (staleNotif) {
      io.to(receiverRoom).emit("notificationDeleted", {
        notificationId: staleNotif._id,
      });
    }

    io.to(senderRoom).emit("statusUpdate", {
      updatedUserId: req.userId,
      newStatus: "disconnect",
    });
    io.to(senderRoom).emit("newNotification", notification);

    return res.status(200).json({ message: "Connection request accepted." });
  } catch (error) {
    console.error("Error accepting connection request:", error);
    return res.status(500).json({ message: "accept connection error", error });
  }
};

// reject connection request
// export const rejectConnection = async (req, res) => {
//   try {
//     const { connectionId } = req.params;
//     const connection = await Connection.findById(connectionId);
//     if (!connection) {
//       return res.status(404).json({ message: "Connection request not found." });
//     }
//     if (connection.status != "pending") {
//       return res
//         .status(400)
//         .json({ message: "Connection request under processed." });
//     }
//     connection.status = "rejected";
//     await connection.save();

//     // Send real-time update
//     const senderSocketId = userSocketMap.get(senderId);
//     const receiverSocketId = userSocketMap.get(receiverId);

//     if (senderSocketId) {
//       io.to(senderSocketId).emit("statusUpdate", {
//         updatedUserId: receiverId,
//         newStatus: "connect",
//       });
//     }

//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit("statusUpdate", {
//         updatedUserId: senderId,
//         newStatus: "connect",
//       });
//     }

//     return res.status(200).json({ message: "Connection request rejected." });
//   } catch (error) {
//     console.error("Error rejecting connection request:", error);
//     return res.status(500).json({ message: "reject connection error", error });
//   }
// };

export const rejectConnection = async (req, res) => {
  try {
    const { connectionId } = req.params;

    // Fetch the connection and populate sender and receiver
    const connection = await Connection.findById(connectionId)
      .populate("sender", "_id")
      .populate("receiver", "_id");

    if (!connection) {
      return res.status(404).json({ message: "Connection request not found." });
    }

    if (connection.status !== "pending") {
      return res.status(400).json({ message: "Connection already processed." });
    }

    // Mark as rejected
    connection.status = "rejected";
    await connection.save();

    // ✅ Extract senderId and receiverId AFTER populate
    const senderId = connection.sender?._id.toString();
    const receiverId = connection.receiver?._id.toString();

    // Delete the stale connectionRequest notification for the person who rejected (receiverId)
    const staleNotif = await Notification.findOneAndDelete({
      receiver: receiverId,
      relatedUser: senderId,
      type: "connectionRequest",
    });

    // Real-time update
    const senderRoom = getUserRoom(senderId);
    const receiverRoom = getUserRoom(receiverId);

    io.to(senderRoom).emit("statusUpdate", {
      updatedUserId: receiverId,
      newStatus: "connect",
    });

    io.to(receiverRoom).emit("statusUpdate", {
      updatedUserId: senderId,
      newStatus: "connect",
    });
    if (staleNotif) {
      io.to(receiverRoom).emit("notificationDeleted", {
        notificationId: staleNotif._id,
      });
    }

    return res.status(200).json({ message: "Connection request rejected." });
  } catch (error) {
    console.error("Error rejecting connection request:", error);
    return res.status(500).json({ message: "reject connection error", error });
  }
};

// get connection status
export const getConnectionStatus = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.userId;

    const currentUser = await User.findById(currentUserId);
    if (currentUser.connection.includes(targetUserId)) {
      return res.status(200).json({ status: "disconnect" });
    }
    const pendingRequest = await Connection.findOne({
      $or: [
        { sender: currentUserId, receiver: targetUserId },
        { sender: targetUserId, receiver: currentUserId },
      ],
      status: "pending",
    });

    if (pendingRequest) {
      if (pendingRequest.sender.toString() === currentUserId.toString()) {
        return res.status(200).json({ status: "pending" });
      } else {
        return res
          .status(200)
          .json({ status: "received", requestId: pendingRequest._id });
      }
    }
    return res.status(200).json({ status: "connect" });
  } catch (error) {
    console.error("Error getting connection status:", error);
    return res
      .status(500)
      .json({ message: "get connection status error", error });
  }
};

// remove connection
export const removeConnection = async (req, res) => {
  try {
    const myId = req.userId;
    const otherUserId = req.params.userId;

    await User.findByIdAndUpdate(myId, { $pull: { connection: otherUserId } });
    await User.findByIdAndUpdate(otherUserId, { $pull: { connection: myId } });

    //  socket io handling
    const receiverRoom = getUserRoom(otherUserId);
    const senderRoom = getUserRoom(myId);

    io.to(receiverRoom).emit("statusUpdate", {
      updatedUserId: myId,
      newStatus: "connect",
    });
    io.to(senderRoom).emit("statusUpdate", {
      updatedUserId: otherUserId,
      newStatus: "connect",
    });

    return res
      .status(200)
      .json({ message: "Connection removed successfully." });
  } catch (error) {
    console.error("Error removing connection:", error);
    return res.status(500).json({ message: "remove connection error", error });
  }
};

// get connection request
export const getConnectionRequest = async (req, res) => {
  try {
    const userId = req.userId;

    const request = await Connection.find({
      receiver: userId,
      status: "pending",
    }).populate(
      "sender",
      "firstName lastName email userName profileImage headline"
    );

    return res.status(200).json({
      message: "Connection requests retrieved successfully.",
      request,
    });
  } catch (error) {
    console.error("Error getting connection requests:", error);
    return res
      .status(500)
      .json({ message: "get connection request error", error });
  }
};

// get user connection
export const getUserConnections = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).populate(
      "connection",
      "firstName lastName userName profileImage headline connections"
    );

    return res.status(200).json({
      message: "User connections retrieved successfully.",
      connections: user.connection,
    });
  } catch (error) {
    console.error("Error getting user connections:", error);
    return res
      .status(500)
      .json({ message: "get user connections error", error });
  }
};
