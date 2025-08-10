const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RolesModel = new Schema(
  {
    number: Number,
    role: String,
  },
  {
    timestamps: true,
    collection: "role",
  }
);

mongoose.model("roles", RolesModel);
