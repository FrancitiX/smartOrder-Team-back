const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tokenSchema = new Schema(
  {
    email: String,
    token: String,
    session: String,
    date: { date: String, time: String },
  },
  {
    timestamps: true,
    collection: "tokens",
  }
);

tokenSchema.pre("save", function (next) {
  const dateMexico = new Date().toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
  });
  const [datePart, timePart] = dateMexico.split(", ");
  this.date = { date: datePart, time: timePart };
  next();
});

mongoose.model("token", tokenSchema);