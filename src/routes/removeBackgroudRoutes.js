const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const { uploadImageBackground } = require("../utils/util");

const {
  removeImageBackground,
} = require("../controllers/removeImageBackgroudcontroller");

router.post(
  "/remove-background",
  upload.single("file"),
  uploadImageBackground,
  removeImageBackground
);

module.exports = router;
