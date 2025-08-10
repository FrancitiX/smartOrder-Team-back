const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tokenModel = new Schema(
  {
    email: String,
    token: String,
    session: String,
  },
  {
    timestamps: true,
    collection: "tokens",
  }
);

mongoose.model("token", tokenModel);