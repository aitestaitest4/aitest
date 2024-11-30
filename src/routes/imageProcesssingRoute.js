const express = require("express");
const imageProcessingController = require("../controllers/imageProcessingController");
const { uploadImageBackground } = require("../utils/util");
const multer = require("multer");
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/process-image",
  upload.single("file"),
  imageProcessingController.processImage
);
router.post(
  "/describe-image",
  upload.single("file"),
  uploadImageBackground,
  imageProcessingController.describeImage
);

module.exports = router;
