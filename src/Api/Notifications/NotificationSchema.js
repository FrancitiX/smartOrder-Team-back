const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema(
  {
    id: { type: String, unique: true},
    department: [{ type: String, required: true }],
    tower: [{ type: String, required: true }],
    title: String,
    short: String,
    description: String,
    images: [String],
    type: { type: String, required: true },
    recipients: [
        {
          user: { type: String, required: true },
          read: { type: Boolean, default: false },
        },
      ],
    date: { date: String, time: String },
  },
  {
    collection: "notifications",
  }
);

notificationSchema.pre("save", function (next) {
  const dateMexico = new Date().toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
  });
  const [datePart, timePart] = dateMexico.split(", ");
  this.date = { date: datePart, time: timePart };
  next();
});

mongoose.model("notifications", notificationSchema);