const express = require("express");
const multer = require("multer");

const {
  handleLogin,
  handleSignup,
  testRoute,
  handleLogout,
  verifyAccount,
} = require("../controllers/authController");
const stripeRoutes = require("./stripeRoute");
const cashfreeRoutes = require("./cashfreeRoutes");
const validateJWT = require("../middleware/authMiddleware");
const validateRole = require("../middleware/roleMiddleware");
const { roles } = require("../constants");

const plagiarismController = require("../controllers/plagiarismController");
const imageProcessingRoutes = require("./imageProcesssingRoute");
const grokXiRoutes = require("./grokXiRoutes");
const textToImageRoutes = require("./textToImageRoutes");
const removeBackgroundRoutes = require("./removeBackgroudRoutes");
const magicStudioRoutes = require("./magicStudioRoutes");
const {
  getTextToImageResult,
} = require("../controllers/TexttoImageController");
const xAutomationRoutes = require("./xautomation");
const audioToTextRoutes = require("./audioTotextRoute");
const textToAudioRoutes = require("./convertTextToAudioRoute");
const translateRoutes = require("./translateRoute");
const writingAssistantRoute = require("./writingAssistantRoute");
const extractChapterRoute = require("./extractChapterRoute");
const generateBlogPostRoute = require("./generateBlogPostRoute");
const textToVideoRoute = require("./textToVideoRoute");
const createResorcesRoute = require("./createResorcesRoute");
const visonApiImageCrateRoute = require("./visionImageCrateRoutes");

const { uploadFileIO } = require("../utils/util");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// -------------------- Auth Routes -------------------- //

router.route("/auth/test").get(testRoute);

// Test role and JWT validation
router
  .route("/auth/test")
  .post(validateJWT, validateRole(roles.user), testRoute);

router.route("/auth/login").post(handleLogin);
router.route("/auth/signup").post(handleSignup);
router.route("/auth/accountVerify/:verifytoken/:userid").post(verifyAccount);
router.route("/auth/logout").post(handleLogout);

// ----------------- Plagiarism Routes ----------------- //

router.post(
  "/plagiarism/upload",
  validateJWT,
  plagiarismController.uploadDocument
);

router.get(
  "/plagiarism/report/:id",
  validateJWT,
  plagiarismController.getPlagiarismReport
);

router.get("/plagiarism/test", validateJWT, plagiarismController.testApi);

router.post(
  "/plagiarism/plagiarism-report",
  validateJWT,
  upload.single("file"),
  uploadFileIO,
  plagiarismController.plagariseApi
);

router.post(
  "/plagiarism/gemini-plagiarism",
  validateJWT,
  upload.single("file"),
  uploadFileIO,
  plagiarismController.geminiPlagiarise
);

router.post(
  "/plagiarism/gemini-pro-plagiarism",
  validateJWT,
  upload.single("file"),
  uploadFileIO,
  plagiarismController.geminiGenrativeModelPlagiarise
);

router.post(
  "/plagiarism/claude-plagiarism",
  validateJWT,
  upload.single("file"),
  uploadFileIO,
  plagiarismController.claudeModelController
);

router.post("/text-prompt", validateJWT, plagiarismController.textPromot);

router.post("/image-generation", validateJWT, plagiarismController.texttoImage);

router.post("/plagiarism/send-email", plagiarismController.sendEmailApi);

router.post(
  "/image-upscale",
  validateJWT,
  plagiarismController.limewireImageUpscale
);

router.post(
  "/image-generation-api",
  validateJWT,
  plagiarismController.generateImage
);
// ----------------- Stripe Routes ----------------- //

router.use("/stripe", stripeRoutes);

// ----------------- Cashfree Routes ----------------- //

router.use("/cashfree", cashfreeRoutes);

// ----------------- Grok Xi Routes ----------------- //

router.use("/grok-xi", validateJWT, grokXiRoutes);

// ----------------- Image Processing Routes ----------------- //

router.use("/image-processing", validateJWT, imageProcessingRoutes);
router.use("/describe-image", validateJWT, imageProcessingRoutes);

// ----------------- Text to Image Routes ----------------- //

router.use("/text-to-image", validateJWT, textToImageRoutes);
router.get("/text-to-image/:inference_id", validateJWT, getTextToImageResult);

// ----------------- Remove Background Routes ----------------- //

router.use("/remove-background", validateJWT, removeBackgroundRoutes);

// ----------------- Magic Studio Routes ----------------- //

router.use("/magic-studio", validateJWT, magicStudioRoutes);

// ----------------- X Automation Routes ----------------- //

router.use("/x-automation", xAutomationRoutes);

// ----------------- Audio to Text Routes ----------------- //

router.use("/audio-to-text", audioToTextRoutes);

// Text to Audio Routes

router.use("/text-to-audio", textToAudioRoutes);

// ----------------- Translate Routes ----------------- //

router.use("/translate", translateRoutes);

// ----------------- Writing Assistant Routes ----------------- //

router.use("/writing-assistant", writingAssistantRoute);

// ----------------- Extract Chapter Routes ----------------- //

router.use("/extract-chapter", extractChapterRoute);

// ----------------- Generate Blog Post Routes ----------------- //

router.use("/generate-blog-post", generateBlogPostRoute);

// ----------------- Text to Video Routes ----------------- //

router.use("/text-to-video", textToVideoRoute);

// ----------------- Create Resources Routes ----------------- //

router.use("/create-resources", createResorcesRoute);
router.use("/get-icons", createResorcesRoute);

// vison api image creations

router.use("/vison-image", visonApiImageCrateRoute);

module.exports = router;
