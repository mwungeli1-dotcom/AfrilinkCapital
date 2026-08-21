const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    // Supplier who owns this product
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Basic Information
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    // Pricing
    price: {
      type: String,
      default: "",
    },

    supplierPrice: { type: Number, min: 0 },

    publicPrice: { type: Number, min: 0 },

    markupPercent: { type: Number, default: 20, min: 0 },

    currency: {
      type: String,
      enum: ["USD", "ZMW"],
      default: "USD",
    },

    // Product Details
    origin: {
      type: String,
      default: "",
    },

    delivery: {
      type: String,
      default: "",
    },

    // Media
    image: {
      type: String,
      default: "",
    },

    video: {
      type: String,
      default: "",
    },

    // Approval Workflow
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    // Visibility
    isActive: {
      type: Boolean,
      default: true,
    },

    // Statistics
    views: {
      type: Number,
      default: 0,
    },

    requestCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", ProductSchema);
