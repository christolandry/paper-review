const cloudinary = require("../middleware/cloudinary");
const Paper = require("../models/Paper");
const User = require("../models/User");
const PaperCounter = require("../models/PaperCounter");
const nodemailer = require('nodemailer');
const client = nodemailer.createTransport({
  service: "Gmail",
  auth: {
      user: "paperreviewapp@gmail.com",
      pass: "owfodzlbjvjrxlrm"
  }
});

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
  getPaper: async (req, res) => {
    try {
      //id parameter comes from the post routes
      //router.get("/:id", ensureAuth, postsController.getPost);
      //http://localhost:2121/post/631a7f59a3e56acfc7da286f
      //id === 631a7f59a3e56acfc7da286f
      const paper = await Paper.findOne({ manuscriptNumber: req.params.manuscriptNumber});
      res.render("paper.ejs", { user: req.user, paper: paper, title: `- Paper ${req.params.manuscriptNumber}`});
    } catch (err) {
      console.log(err);
    }
  },
  postPaper: async (req, res) => {
    try {
      console.log("-----------------")
      console.log("This is: postPaper in papers.js controllers")
      console.log(req.body.hasOwnProperty("agree"))
      const paper = await Paper.findOne({ manuscriptNumber: req.params.manuscriptNumber});
      console.log("********** Check 1 **************")
      //if they didn't agree to terms, send them back to the page.
      if(!req.body.hasOwnProperty("agree") || paper.author == req.user.id){
        res.redirect(`paper/${req.params.manuscriptNumber}`);
      }
      await Paper.findOneAndUpdate(
        { manuscriptNumber: req.params.manuscriptNumber },
        {
          reviewAccepted: Date.now(),
          reviewerID: req.user.reviewerID, 
          status: "Under Review"        
        }
      );
      res.redirect("/user/reviewer");
    } catch (err) {
      console.log(err);
    }
  },
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
      //get all email address that have the subject of the paper being added and send out an email to them.
      
      let users = await User.find()
      console.log(users)
      let filteredUsers = users.filter(i => {
        console.log(i.subjects)
        console.log(req.body.type)
        return i.subjects.includes(req.body.type.toLowerCase()) && (i.email !== req.user.email)})
      console.log(filteredUsers)

      filteredUsers.forEach(user => {
        client.sendMail(
          {
            from: "paperreviewapp@gmail.com",
            to: user.email,
            subject: "Paper Review - A new paper of your subject matter has been uploaded",
            html: "Click this <a href='https://paper-review.vercel.app/papers'>link</a> to view all papers you can review",
          }
        )
        console.log(`Email sent to: ${user.email}`)
      })

      res.redirect("/user/author");
    } catch (err) {
      console.log(err);
    }
  },
  submitReview: async (req, res) => {
    try {
      // Upload pdf to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);
      console.log("*********** Check 1 **************")
      console.log(req.params.manuscriptNumber)
      console.log("*********** Check 2 **************")
      //media is stored on cloudainary - the above request responds with url to media and the media id that will be needed when deleting content 
      await Paper.findOneAndUpdate(
        { manuscriptNumber: req.params.manuscriptNumber },
        {
          reviewCompleted: Date.now(),
          status: "Review Complete",          
          documentReview: result.secure_url,
          cloudinaryIdReview: result.public_id,        
        }
      );
      console.log("*********** Check 3 **************")
      res.redirect("/user/reviewer");
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
