const mongoose = require("mongoose");

const visitorSessionSchema = new mongoose.Schema({
  visitorId: { type: String, required: true, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  role: { type: String, default: "guest" },
  page: { type: String, default: "/" },
  firstSeen: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now, index: true, expires: 180 },
}, { timestamps: false });

module.exports = mongoose.model("VisitorSession", visitorSessionSchema);
