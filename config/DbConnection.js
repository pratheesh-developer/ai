const mongoose = require("mongoose");

exports.DbConnection = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/bnidata");
    console.log("db is connected");
  } catch (error) {
    console.log(error);
  }
};
