const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const employeModel = new Schema(
  {
    role: {
      type: String,
      enum: ["admin", "user"],
    },
    email: { type: String, unique: true },
    cellphone: Number,
    salt: String,
    password: String,
    rol: Number,
    restaurants: [ String ],
  },
  {
    collection: "users",
  }
);

employeModel.pre("save", function (next) {
  const dateMexico = new Date().toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
  });
  const [datePart, timePart] = dateMexico.split(", ");
  this.date = { date: datePart, time: timePart };
  next();
});

mongoose.model("user", employeModel);