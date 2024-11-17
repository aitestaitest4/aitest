const express = require("express");
const imageProcessingController = require("../controllers/imageProcessingController");
const multer = require("multer");
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/process-image",
  upload.single("file"),
  imageProcessingController.processImage
);

module.exports = router;
