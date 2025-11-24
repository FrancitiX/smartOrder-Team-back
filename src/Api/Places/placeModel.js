const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const placesModel = new Schema(
  {
    id: { type: String, required: true },
    restaurant: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    images: { type: [String], default: [] },
    status: { type: String, enum: ["available", "reserved", "occupied"], default: "available" }
  },
  {
    timestamps: true,
    collection: "places",
  }
);

mongoose.model("place", placesModel);