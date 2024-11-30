const express = require("express");
const router = express.Router();
const { uploadAudio } = require("../utils/util");
const textToAudioController = require("../controllers/textToAudioController");

router.post("/convert-text", textToAudioController.convertTextToAudio);

module.exports = router;
