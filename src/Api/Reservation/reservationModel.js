const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reservationModel = new Schema(
  {
    id: { type: String, required: true, unique: true },
    restaurant: { type: String, required: true },
    customer: { type: String, required: true },
    site: { type: String, required: true },
    people: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "canceled", "completed"],
      default: "pending",
    },
    time: {
      day: String, // ejemplo: "Lunes"
      time: String, // ejemplo: "18:00"
    },
    date: {
      date: String,
      time: String,
    },
    price: { type: String },
  },
  {
    timestamps: true,
    collection: "reservations",
  }
);

reservationModel.pre("save", function (next) {
  const dateMexico = new Date().toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
  });
  const [datePart, timePart] = dateMexico.split(", ");
  this.date = { date: datePart, time: timePart };
  next();
});

mongoose.model("reservation", reservationModel);