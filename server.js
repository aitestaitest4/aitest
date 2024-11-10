const serverless = require("serverless-http");
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const cors = require("cors");
const { connectToDatabase } = require("./src/services/dbService");
const app = express();

app.use(express.json());
app.use(bodyParser.json());

app.use(cors());

const router = require("./src/routes/index");

app.use("/api", router);

// Serverless handler export
module.exports.handler = serverless(app);

// Local server setup
if (process.env.NODE_ENV !== "lambda") {
  const port = process.env.PORT || 3001;
  app.listen(port, async () => {
    await connectToDatabase(); // Ensure database is connected
    console.log(`Server running on port ${port}`);
  });
}
