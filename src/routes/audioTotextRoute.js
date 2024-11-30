const express = require("express");
const router = express.Router();
const { uploadAudio } = require("../utils/util");
const audioToTextController = require("../controllers/audiotoTextController");

router.post(
  "/convert-audio",
  uploadAudio,
  audioToTextController.convertAudioToText
);

module.exports = router;
