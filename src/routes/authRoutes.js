const express = require("express");
const {
  handleLogin,
  handleSignup,
  testRoute,
  handleLogout,
  verifyAccount
} = require("../controllers/authController");
const validateJWT = require("../middleware/authMiddleware");
const validateRole = require("../middleware/roleMiddleware");
const { roles } = require("../constants");

const router = express.Router();

router.route("/test").get(testRoute);

// for testing roles and jwt
router.route("/test").post(validateJWT, validateRole(roles.user), testRoute);

router.route("/login").post(handleLogin);
router.route("/signup").post(handleSignup);
router.route("/accountVerify/:verifytoken/:userid").post(verifyAccount);
router.route("/logout").post(handleLogout);

module.exports = router;
