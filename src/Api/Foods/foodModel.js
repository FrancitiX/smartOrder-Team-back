const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FoodModel = new Schema(
  {
    name: String,
    restaurant: String,
    description: String,
    price: Number,
    category: [String],
    images: [String],
    sales: { type: Number, default: 0 },
    date: { date: String, time: String }
  },
  {
    timestamps: true,
    collection: "foods",
  }
);

FoodModel.pre("save", function (next) {
  const dateMexico = new Date().toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
  });
  const [datePart, timePart] = dateMexico.split(", ");
  this.date = { date: datePart, time: timePart };
  next();
});

mongoose.model("food", FoodModel);