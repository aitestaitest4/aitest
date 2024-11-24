const express = require("express");
const router = express.Router();

const { authHandler, revokeHandler } = require("../controllers/xautomation");

router.get("/auth", authHandler);
router.get("/revoke", revokeHandler);

module.exports = router;
