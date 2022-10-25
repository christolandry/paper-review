const express = require("express");
const router = express.Router();
const userController = require("../controllers/users");
const { ensureAuth } = require("../middleware/auth");

//User Routes
//Since linked from server js treat each path as:
router.get("/", ensureAuth, userController.getPost);

module.exports = router;
