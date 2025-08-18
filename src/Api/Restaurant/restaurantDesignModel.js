const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const restaurantDesignModel = new Schema(
  {
    restaurant: { type: String, required: true },
    background: {
      typee: { type: String, default: "" },
      color: { type: String, default: "" },
      image: { type: String, default: "" },
    },
    style: { type: Number, default: 0 },
    divisions: { type: Number, default: 0 },
    header: { type: Boolean, default: false },
    headerText: { type: String, default: "" },
    mainColor: { type: String, default: "" },
    secondaryColor: { type: String, default: "" },
    moreColors: { type: [String], default: [] },
    font: { type: String, default: "default" },
  },
  {
    timestamps: true,
    collection: "restaurant_designs",
  }
);

mongoose.model("restaurant_design", restaurantDesignModel);