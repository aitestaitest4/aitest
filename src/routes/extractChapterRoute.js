const express = require("express");
const router = express.Router();
const { extractChapter } = require("../controllers/extractChapter");

router.post("/extract-chapter", extractChapter);

module.exports = router;
