import mongoose from "mongoose";
const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      require: true,
    },
    lastName: {
      type: String,
      require: true,
    },
    userName: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return v.trim().length > 0;
        },
        message: "Username cannot be empty",
      },
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return v.trim().length > 0;
        },
        message: "Email cannot be empty",
      },
    },
    password: {
      type: String,
      require: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
    },
    headline: {
      type: String,
      default: "",
    },
    skills: [{ type: String }],
    education: [
      {
        college: { type: String },
        degree: { type: String },
        fieldOfStudy: { type: String },
      },
    ],
    location: {
      type: String,
      default: "Peshawar",
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    experience: [
      {
        title: { type: String },
        company: { type: String },
        description: { type: String },
      },
    ],
    connection: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
export default User;
