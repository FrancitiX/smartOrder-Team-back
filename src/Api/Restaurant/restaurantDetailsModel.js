const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const restaurant_detailsModel = new Schema(
  {
    id: String,
    name: String,
    mainImage: String,
    images: [{ route: String, name: String }],
    rate: { type: Number, default: 0, enum: [0, 1, 2, 3, 4, 5] },
    workingDays: [
      {
        day: {
          type: String,
          enum: [
            "Lunes",
            "Martes",
            "Miercoles",
            "Jueves",
            "Viernes",
            "Sabado",
            "Domingo",
          ],
          default: "Lunes",
        },
        open: String,
        close: String,
      },
    ],
    maxCapacity: { type: Number, default: 10 },
    currentCapacity: { type: Number, default: 0 },
    state: {
      type: String,
      enum: ["available", "mid", "full", "saturated"],
      default: "available",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "closed"],
      default: "active",
    },
  },
  {
    collection: "restaurant_details",
  }
);

mongoose.model("restaurant_details", restaurant_detailsModel);
