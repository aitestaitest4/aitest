const express = require("express");
const router = express.Router();
const {
  generateImageController,
} = require("../controllers/visonApiImageGenrationController");

router.post("/vision/generate-image", generateImageController);

module.exports = router;
