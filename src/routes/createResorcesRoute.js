const express = require("express");
const router = express.Router();
const {
  createResourcesController,
  getIconsController,
} = require("../controllers/createResoucresController");

router.get("/", createResourcesController);
router.get("/get-icons", getIconsController);

module.exports = router;
