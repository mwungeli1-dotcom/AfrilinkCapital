const mongoose = require("mongoose");

const supplierRfqSchema = new mongoose.Schema(
  {
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "Request", required: true, index: true },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, trim: true, default: "Please provide your best factory price and delivery terms." },
    deadline: Date,
    status: { type: String, enum: ["Sent", "Responded", "Closed"], default: "Sent" },
    currency: { type: String, enum: ["USD", "ZMW"] },
    unitPrice: { type: Number, min: 0 },
    minimumOrderQuantity: { type: String, trim: true },
    leadTime: { type: String, trim: true },
    shippingTerms: { type: String, trim: true },
    notes: { type: String, trim: true },
    respondedAt: Date,
  },
  { timestamps: true }
);

supplierRfqSchema.index({ requestId: 1, supplierId: 1 }, { unique: true });

module.exports = mongoose.model("SupplierRfq", supplierRfqSchema);
