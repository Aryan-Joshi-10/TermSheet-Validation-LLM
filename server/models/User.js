const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contact: { type: String, required: true },
  address: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  date: { type: Date, default: Date.now },
  profilePicture: { type: String },
});

const userModel = mongoose.model("constomerr", userSchema);

module.exports = userModel;
