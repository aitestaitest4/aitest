const express = require("express");
const router = express.Router();
const { textToVideo } = require("../controllers/textToVideo");

router.post("/text-to-video", textToVideo);

module.exports = router;
