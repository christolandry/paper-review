const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const papersController = require("../controllers/papers");
const { ensureAuth } = require("../middleware/auth");

//Papers Routes

//Enables user to create post w/ cloudinary for media uploads
router.post("/submit", upload.single("file"), papersController.createPaper);

//Since linked from server js treat each path as:
//get/:id, post/createPost, post/likePost/:id, post/deletePost/:id
router.get("/paper/:manuscriptNumber", ensureAuth, papersController.getPaper);

//post/:id agree to review a paper
router.post("/review/:manuscriptNumber", ensureAuth, papersController.postPaper);

//Upload of a review
router.post("/submitReview/:manuscriptNumber", upload.single("file"), papersController.submitReview);

//Page for user to submit a paper
router.get("/submit", papersController.getSubmit);

//Page for user to see all papers they can review
router.get("/", papersController.getPapers);

//Enables user to like post. In controller, uses POST model to update likes by 1
// router.put("/likePost/:id", postsController.likePost);

//Enables user to delete post. In controller, uses POST model to delete post from MongoDB collection
// router.delete("/deletePost/:id", postsController.deletePost);

module.exports = router;
