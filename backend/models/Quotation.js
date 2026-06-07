const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema(
  {
    supplierName: {
      type: String,
      required: true,
    },

    supplierEmail: {
      type: String,
      required: true,
    },

    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      required: true,
    },

    price: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Quotation", quotationSchema);