const mongoose = require("mongoose");

const pageVisitSchema = new mongoose.Schema({
  visitorId: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  role: { type: String, default: "guest" },
  page: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now, index: true, expires: 7776000 },
}, { timestamps: false });

module.exports = mongoose.model("PageVisit", pageVisitSchema);
