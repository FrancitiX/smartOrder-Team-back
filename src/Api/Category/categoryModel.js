const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categoriesModel = new Schema(
  {
    name: String,
    restaurant: String,
    description: String,
  },
  {
    timestamps: true,
    collection: "categories",
  }
);

mongoose.model("category", categoriesModel);