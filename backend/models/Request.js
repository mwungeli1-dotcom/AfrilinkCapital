const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    deliveryLocation: {
      type: String,
      trim: true,
    },

    title: String,

    description: String,

    quantity: String,

    country: String,

    status: {
      type: String,
      default: "Received",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Request", RequestSchema);
