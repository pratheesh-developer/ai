const mongoose = require("mongoose");

exports.DbConnection = async () => {
  try {
    await mongoose.connect("mongodb+srv://ai:ai@cluster0.s449ypy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
    console.log("db is connected");
  } catch (error) {
    console.log(error);
  }
};
