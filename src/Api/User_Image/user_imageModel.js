const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userImageModel = new Schema(
  {
    email: { type: String, unique: true },
    image: String,
    bgImage: { type: String, default: "0"},
    date: { date: String, time: String },
  },
  {
    timestamps: true,
    collection: "userImage",
  }
);

userImageModel.pre("save", function (next) {
  const dateMexico = new Date().toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
  });
  const [datePart, timePart] = dateMexico.split(", ");
  this.date = { date: datePart, time: timePart };
  next();
});

mongoose.model("userImage", userImageModel);