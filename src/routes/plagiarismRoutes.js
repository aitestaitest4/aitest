const express = require("express");
const router = express.Router();
const multer = require("multer");

const { uploadFileIO } = require("../utils/util");
const plagiarismController = require("../controllers/plagiarismController");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", plagiarismController.uploadDocument);

router.get("/report/:id", plagiarismController.getPlagiarismReport);

router.get("/test", plagiarismController.testApi);

router.post(
  "/plagiarism-report",
  upload.single("file"),
  uploadFileIO,
  plagiarismController.plagariseApi
);

router.post(
  "/gemini-plagiarism",
  upload.single("file"),
  uploadFileIO,
  plagiarismController.geminiPlagiarise
);

router.post(
  "/gemini-pro-plagiarism",
  upload.single("file"),
  uploadFileIO,
  plagiarismController.geminiGenrativeModelPlagiarise
);

router.post(
  "/claude-plagiarism",
  upload.single("file"),
  uploadFileIO,
  plagiarismController.claudeModelController
);

router.post("/text-prompt", plagiarismController.textPromot);

router.post("/send-email", plagiarismController.sendEmailApi);

router.post("/image-generation", plagiarismController.texttoImage);

router.post("/image-upscale", plagiarismController.limewireImageUpscale);

router.post("/image-generation-api", plagiarismController.generateImage);

module.exports = router;
