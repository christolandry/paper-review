const cloudinary = require("../middleware/cloudinary");
const Paper = require("../models/Paper");
const PaperCounter = require("../models/PaperCounter");

module.exports = {
  // getProfile: async (req, res) => { 
  //   console.log(req.user)
  //   try {
  //     //Since we have a session each request (req) contains the logged-in users info: req.user
  //     //console.log(req.user) to see everything
  //     //Grabbing just the posts of the logged-in user
  //     const posts = await Post.find({ user: req.user.id });
  //     //Sending post data from mongodb and user data to ejs template
  //     res.render("profile.ejs", { posts: posts, user: req.user });
  //   } catch (err) {
  //     console.log(err);
  //   }
  // },
  // getPost: async (req, res) => {
  //   try {
  //     //id parameter comes from the post routes
  //     //router.get("/:id", ensureAuth, postsController.getPost);
  //     //http://localhost:2121/post/631a7f59a3e56acfc7da286f
  //     //id === 631a7f59a3e56acfc7da286f
  //     const post = await Post.findById(req.params.id);
  //     res.render("post.ejs", { post: post, user: req.user});
  //   } catch (err) {
  //     console.log(err);
  //   }
  // },
  createPaper: async (req, res) => {
    try {
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);
      await PaperCounter.findOneAndUpdate(
              { title: "counter"},
              {
                $inc: { current : 1 },
              }
            );
      const counter = await PaperCounter.findOne({ title: "counter" });
      //media is stored on cloudainary - the above request responds with url to media and the media id that will be needed when deleting content 
      await Paper.create({
        manuscriptNumber: counter.current,
        title: req.body.title,
        type: req.body.type,
        document: result.secure_url,
        cloudinaryId: result.public_id,        
        author: req.user.id,
      });
      console.log("Paper has been added!");
      res.redirect("/user/author");
    } catch (err) {
      console.log(err);
    }
  },
  getSubmit: async (req, res) => {
    try {
      res.render("submit.ejs", { user: req.user, title: "- Submit a Paper" });
    } catch (err) {
      console.log(err);
    }
  },
  getPapers: async (req, res) => {
    try {
      const papers = await Paper.find();
      let filteredPapers = papers.filter(paper => req.user.subjects.includes(paper.type.toLowerCase()))
      res.render("papers.ejs", { user: req.user, papers: filteredPapers, title: "- Available Papers" });
    } catch (err) {
      console.log(err);
    }
  }
  // likePost: async (req, res) => {
  //   try {
  //     await Post.findOneAndUpdate(
  //       { _id: req.params.id },
  //       {
  //         $inc: { likes: 1 },
  //       }
  //     );
  //     console.log("Likes +1");
  //     res.redirect(`/post/${req.params.id}`);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // },
  // deletePost: async (req, res) => {
  //   try {
  //     // Find post by id
  //     let post = await Post.findById({ _id: req.params.id });
  //     // Delete image from cloudinary
  //     await cloudinary.uploader.destroy(post.cloudinaryId);
  //     // Delete post from db
  //     await Post.remove({ _id: req.params.id });
  //     console.log("Deleted Post");
  //     res.redirect("/profile");
  //   } catch (err) {
  //     res.redirect("/profile");
  //   }
  // },
};
