const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema(
  {
    quotationNumber: { type: String, required: true, unique: true, sparse: true },
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "Request", required: true },
    supplierName: { type: String, required: true },
    supplierEmail: { type: String, lowercase: true, trim: true },
    currency: { type: String, enum: ["ZMW", "USD"], default: "ZMW" },
    supplierCost: { type: Number, required: true, min: 0 },
    freightCost: { type: Number, default: 0, min: 0 },
    customsCost: { type: Number, default: 0, min: 0 },
    serviceFee: { type: Number, default: 0, min: 0 },
    markupAmount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    deliveryTime: { type: String, required: true },
    validityDays: { type: Number, default: 14, min: 1 },
    terms: { type: String, default: "70% deposit, 30% before delivery." },
    notes: String,
    status: { type: String, enum: ["Draft", "Sent", "Accepted", "Rejected", "Expired"], default: "Draft" },
    paymentStatus: { type: String, enum: ["Unpaid", "Partially Paid", "Paid", "Refunded"], default: "Unpaid" },
    amountPaid: { type: Number, default: 0, min: 0 },
    paymentMethod: { type: String, enum: ["", "Bank Transfer", "Mobile Money", "Cash", "Card", "Other"], default: "" },
    paymentReference: String,
    paymentNotes: String,
    acceptedAt: Date,
    rejectedAt: Date,
    paidAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quotation", quotationSchema);
