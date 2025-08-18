const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const configModel = new Schema(
  {
    user: { type: String, required: true },
    theme: { type: String, default: "dark" },
    reservations: { type: Boolean, default: true },
    publicWorkTime: { type: Boolean, default: true },
    publicContact: { type: Boolean, default: true },
    publicDescription: { type: Boolean, default: true },
    notifications: { type: Boolean, default: true },
    alerts: { type: Boolean, default: true },
    onlyRestaurant: { type: Boolean, default: false },
    reports: { type: Boolean, default: false },
    grafics: { type: Boolean, default: false },
    adminUsers: { type: Boolean, default: false },
    adminFoods: { type: Boolean, default: false },
    adminCategories: { type: Boolean, default: false },
    adminPlaces: { type: Boolean, default: false },
    adminReservations: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: "configurations",
  }
);

mongoose.model("configuration", configModel);