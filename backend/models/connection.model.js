import mongoose from "mongoose";
const connectionSchema = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

connectionSchema.index({
  sender: 1,
  createdAt: 1,
});

const Connection = mongoose.model("Connection", connectionSchema);
export default Connection;