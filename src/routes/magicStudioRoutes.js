const express = require("express");

const router = express.Router();
const magicstudioAiController = require("../controllers/magicstudioAi");

router.post("/erase-image", magicstudioAiController.magicstudioAiEraseImage);

module.exports = router;
