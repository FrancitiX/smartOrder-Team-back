const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const restaurantModel = new Schema(
  {
    id: String,
    name: String,
    description: String,
    owner: String,
    contact: {
      email: String,
      phone: {
        countryCode: String,
        number: String
      }
    },
    category: [String],
    foods: [String],
    date: {
      date: String,
      time: String
    }
  },
  {
    timestamps: true,
    collection: "restaurants",
  }
);

restaurantModel.pre("save", function (next) {
  const dateMexico = new Date().toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
  });
  const [datePart, timePart] = dateMexico.split(", ");
  this.date = { date: datePart, time: timePart };
  next();
});

mongoose.model("restaurant", restaurantModel);