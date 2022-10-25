const express = require("express");
const router = express.Router();
const reviewerController = require("../controllers/reviewer");
const { ensureAuth } = require("../middleware/auth");

//User Routes
//Since linked from server js treat each path as:
router.get("/", ensureAuth, reviewerController.getPost);

module.exports = router;
