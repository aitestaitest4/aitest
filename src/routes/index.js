const express = require("express");
const multer = require("multer");

const {
  handleLogin,
  handleSignup,
  testRoute,
  handleLogout,
  verifyAccount,
} = require("../controllers/authController");
const cashfreeRoutes = require("./cashfreeRoutes");
const validateJWT = require("../middleware/authMiddleware");
const validateRole = require("../middleware/roleMiddleware");
const { roles } = require("../constants");

const plagiarismController = require("../controllers/plagiarismController");
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

router.post("/plagiarism/upload", plagiarismController.uploadDocument);

router.get("/plagiarism/report/:id", plagiarismController.getPlagiarismReport);

router.get("/plagiarism/test", plagiarismController.testApi);

router.post(
  "/plagiarism/plagiarism-report",
  upload.single("file"),
  uploadFileIO,
  plagiarismController.plagariseApi
);

router.post(
  "/plagiarism/gemini-plagiarism",
  upload.single("file"),
  uploadFileIO,
  plagiarismController.geminiPlagiarise
);

router.post(
  "/plagiarism/gemini-pro-plagiarism",
  upload.single("file"),
  uploadFileIO,
  plagiarismController.geminiGenrativeModelPlagiarise
);

router.post(
  "/plagiarism/claude-plagiarism",
  upload.single("file"),
  uploadFileIO,
  plagiarismController.claudeModelController
);

router.post("/text-prompt", plagiarismController.textPromot);

router.post("/image-generation", plagiarismController.texttoImage);

router.post("/plagiarism/send-email", plagiarismController.sendEmailApi);

router.post("/image-upscale", plagiarismController.limewireImageUpscale);


// ----------------- Cashfree Routes ----------------- //

router.use("/cashfree", cashfreeRoutes);

module.exports = router;
