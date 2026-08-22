const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["rfq", "quotation", "response", "payment", "approval", "system"], default: "system" },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    href: { type: String, trim: true, default: "/dashboard" },
    readAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
