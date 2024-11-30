const express = require("express");
const router = express.Router();

const {
  runAdaptiveMtProcess,
} = require("../controllers/translationController");

router.post("/run-adaptive-mt-process", runAdaptiveMtProcess);

module.exports = router;
