const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema(
  {
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