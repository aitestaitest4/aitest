const express = require("express");
const router = express.Router();

const grokBetController = require("../controllers//GrokBetController");

router.post("/grok-chat", grokBetController.grokChat);
router.post("/clear-chat", grokBetController.clearChat);

module.exports = router;
