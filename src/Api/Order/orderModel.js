const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderModel = new Schema(
  {
    id: String,
    restaurant: String,
    customer: String,
    items: [
      {
        foodId: String,
        quantity: Number
      }
    ],
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "canceled"],
      default: "pending"
    },
    price: {
      type: Number,
      required: true
    },
    date: { date: String, time: String },
  },
  {
    timestamps: true,
    collection: "orders",
  }
);

orderModel.pre("save", function (next) {
  const dateMexico = new Date().toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
  });
  const [datePart, timePart] = dateMexico.split(", ");
  this.date = { date: datePart, time: timePart };
  next();
});

mongoose.model("order", orderModel);