const express = require("express");
const multer = require("multer");
const { uploadImageBackground } = require("../utils/util");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });
const generateBlogPostController = require("../controllers/blockPostCreateController");

router.post(
  "/generate-blog-post",
  upload.single("file"),
  generateBlogPostController.generateBlogPost
);

module.exports = router;
