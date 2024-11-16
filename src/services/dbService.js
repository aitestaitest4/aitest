const mongoose = require("mongoose");
require("dotenv").config();

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

let databaseConnection;

exports.connectToDatabase = async () => {
  if (databaseConnection) {
    return;
  }

  try {
    databaseConnection = mongoose.connect(process.env.MONGODB_URI, options);
    await databaseConnection;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
    throw new Error("Database connection failed");
  }
};
