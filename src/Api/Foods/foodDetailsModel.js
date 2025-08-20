const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FoodDetailsModel = new Schema(
  {
    name: String,
    restaurant: String,
    prices: [{ price: Number, date: String }],
    color: { type: String, default: "" },
    details: { type: String, default: "" }
  },
  {
    timestamps: true,
    collection: "foods_details",
  }
);

mongoose.model("food_details", FoodDetailsModel);