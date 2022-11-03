const express = require("express");
const router = express.Router();
const userController = require("../controllers/users");
const { ensureAuth } = require("../middleware/auth");

//User Routes
//Since linked from server js treat each path as:
router.get("/", ensureAuth, userController.getUser);

//user author page
router.get("/author", ensureAuth, userController.getAuthor);

//user reviewer page
router.get("/reviewer", ensureAuth, userController.getReviewer);

module.exports = router;
