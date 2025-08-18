const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const employeeModel = new Schema(
  {
    email: { type: String, unique: true },
    type: {
      type: String,
      enum: ["admin", "owner", "employee"],
    },
    state: { type: String, enum: ["active", "inactive"] },
    restaurants: [ String ],
    workTime: { 
      init: String,
      end: String
    },
  },
  {
    timestamps: true,
    collection: "clients",
  }
);

// employeeModel.pre("save", function (next) {
//   const dateMexico = new Date().toLocaleString("es-MX", {
//     timeZone: "America/Mexico_City",
//   });
//   const [datePart, timePart] = dateMexico.split(", ");
//   this.date = { date: datePart, time: timePart };
//   next();
// });

mongoose.model("clients", employeeModel);