const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const papersController = require("../controllers/papers");
const { ensureAuth } = require("../middleware/auth");

//Papers Routes
//Since linked from server js treat each path as:
//post/:id, post/createPost, post/likePost/:id, post/deletePost/:id
// router.get("/:id", ensureAuth, postsController.getPost);

//Enables user to create post w/ cloudinary for media uploads
router.post("/submit", upload.single("file"), papersController.createPaper);

//Page for user to submit a paper
router.get("/submit", papersController.getSubmit);

//Enables user to like post. In controller, uses POST model to update likes by 1
// router.put("/likePost/:id", postsController.likePost);

//Enables user to delete post. In controller, uses POST model to delete post from MongoDB collection
// router.delete("/deletePost/:id", postsController.deletePost);

module.exports = router;
