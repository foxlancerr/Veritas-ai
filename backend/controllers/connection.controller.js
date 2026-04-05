import Connection from "../models/connection.model.js";
import User from "../models/user.model.js";

import { io, userSocketMap } from "../index.js";
import Notification from "../models/notification.model.js";

// send connection request
export const sendConnection = async (req, res) => {
  try {
    const { id } = req.params;
    let sender = req.userId;
    let user = await User.findById(sender);
    if (sender == id) {
      return res
        .status(400)
        .json({ message: "You cannot send a connection request to yourself." });
    }
    if (user.connection.includes(id)) {
      return res.status(400).json({ message: "You are already connected." });
    }
    let existingConnection = await Connection.findOne({
      sender,
      receiver: id,
      status: "pending",
    });
    if (existingConnection) {
      return res
        .status(400)
        .json({ message: "Connection request already exist." });
    }
    const newRequest = await Connection.create({ sender, receiver: id });
    //  socket io handling
    let receiverSocketId = userSocketMap.get(id);
    let senderSocketId = userSocketMap.get(sender);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("statusUpdate", {
        updatedUserId: sender,
        newStatus: "received",
      });
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("statusUpdate", {
        updatedUserId: id,
        newStatus: "pending",
      });
    }
    return res
      .status(200)
      .json({ message: "Connection request sent successfully.", newRequest });
  } catch (error) {
    console.error("Error sending connection request:", error);
    return res.status(500).json({ message: "send connection error", error });
  }
};

// accept connection request
export const acceptConnection = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.userID;
    const connection = await Connection.findById(connectionId);
    if (!connection) {
      return res.status(404).json({ message: "Connection request not found." });
    }
    if (connection.status != "pending") {
      return res
        .status(400)
        .json({ message: "Connection request under processed." });
    }
    connection.status = "accepted";
    console.log("Creating notification with relatedUser:", userId);
    await Notification.create({
      receiver: connection.sender,
      type: "connectionAccepted",
      relatedUser: req.userId,
    });
    await connection.save();
    await User.findByIdAndUpdate(req.userId, {
      $addToSet: { connection: connection.sender._id },
    });
    await User.findByIdAndUpdate(connection.sender._id, {
      $addToSet: { connection: req.userId },
    });

    //  socket io handling
    let receiverSocketId = userSocketMap.get(
      connection.receiver._id.toString()
    );
    let senderSocketId = userSocketMap.get(connection.sender._id.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("statusUpdate", {
        updatedUserId: connection.sender._id,
        newStatus: "disconnect",
      });
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("statusUpdate", {
        updatedUserId: req.userId,
        newStatus: "disconnect",
      });
    }

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

    // Real-time update
    const senderSocketId = userSocketMap.get(senderId);
    const receiverSocketId = userSocketMap.get(receiverId);

    if (senderSocketId) {
      io.to(senderSocketId).emit("statusUpdate", {
        updatedUserId: receiverId,
        newStatus: "connect",
      });
    }

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("statusUpdate", {
        updatedUserId: senderId,
        newStatus: "connect",
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
    let receiverSocketId = userSocketMap.get(otherUserId);
    let senderSocketId = userSocketMap.get(myId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("statusUpdate", {
        updatedUserId: myId,
        newStatus: "connect",
      });
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("statusUpdate", {
        updatedUserId: otherUserId,
        newStatus: "connect",
      });
    }

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
