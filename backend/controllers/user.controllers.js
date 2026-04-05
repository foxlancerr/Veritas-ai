import uploadOnCloudinary from "../config/cloudinary.js";
import User from "../models/user.model.js";

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res
      .status(200)
      .json({ message: "User retrieved successfully.", user });
  } catch (error) {
    console.error("Error fetching current user:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, userName, headline, location, gender } =
      req.body;
    const skills = req.body.skills ? JSON.parse(req.body.skills) : [];
    const education = req.body.education ? JSON.parse(req.body.education) : [];
    const experience = req.body.experience
      ? JSON.parse(req.body.experience)
      : [];
    let profileImage, coverImage;
    if (req.files.profileImage) {
      profileImage = await uploadOnCloudinary(req.files.profileImage[0].path);
    }
    if (req.files.coverImage) {
      coverImage = await uploadOnCloudinary(req.files.coverImage[0].path);
    }
    let user = await User.findByIdAndUpdate(
      req.userId,
      {
        firstName,
        lastName,
        userName,
        headline,
        location,
        gender,
        skills,
        education,
        experience,
        profileImage,
        coverImage,
      },
      { new: true }
    ).select("-password");
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error in handle update controller" });
  }
};

// get user profile
export const getProfile = async (req, res) => {
  try {
    const { userName } = req.params;
    const user = await User.findOne({ userName }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res
      .status(200)
      .json({ message: "User retrieved successfully.", user });
  } catch (error) {
    console.error("Error fetching get profile:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// searching for user
export const searchUser = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res
        .status(400)
        .json({ message: "Query parameter is required for search." });
    }
    const users = await User.find({
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { userName: { $regex: query, $options: "i" } },
        { skills: { $elemMatch: { $regex: query, $options: "i" } } },
      ],
    }).select("-password");
    return res.status(200).json({ users });
  } catch (error) {
    console.error("Error searching user:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// get suggested user
export const getSuggestedUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId).select("connection");
    const suggestedUser = await User.find({
      _id: {
        $ne: currentUser,
        $nin: currentUser.connection,
      },
    }).select("-password");
    return res.status(200).json({
      message: "Suggested users retrieved successfully.",
      suggestedUser,
    });
  } catch (error) {
    console.error("Error fetching suggested users:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};
