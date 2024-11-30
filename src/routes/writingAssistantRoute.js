const express = require("express");
const router = express.Router();
const writingAssistantController = require("../controllers/writingAssistantController");

router.post(
  "/generate-presentation",
  writingAssistantController.generatePresentation
);

module.exports = router;
