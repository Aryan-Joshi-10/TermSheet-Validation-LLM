const mongoose = require("mongoose");
require("dotenv").config();
const Mongo_url = process.env.Mongo_url;

mongoose
  .connect(Mongo_url)
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log("mongodb connection err" + err));
