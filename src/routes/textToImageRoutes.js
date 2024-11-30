const express = require("express");
const router = express.Router();

const {
  texttoImage,
  getTextToImageResult,
} = require("../controllers/TexttoImageController");

router.post("/text-to-image", texttoImage);
router.get("/text-to-image/:inference_id", getTextToImageResult);

module.exports = router;
