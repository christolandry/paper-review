const express = require("express");
const router = express.Router();
const authorController = require("../controllers/author");
const { ensureAuth } = require("../middleware/auth");

//User Routes
//Since linked from server js treat each path as:
router.get("/", ensureAuth, authorController.getAuthor);

module.exports = router;
