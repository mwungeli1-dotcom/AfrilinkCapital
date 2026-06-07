const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: String,
    category: String,
    price: String,
    delivery: String,
    origin: String,
    description: String,

    image: {
      type: String,
      default: "",
    },

    video: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", ProductSchema);