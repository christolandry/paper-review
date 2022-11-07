const Paper = require("../models/Paper");
const User = require("../models/User");

module.exports = {
  getUser: async (req, res) => {
    try {
      //Grabbing just the papers of the logged-in user
      const papersSubmited = await Paper.find({ author: req.user.id });
      const papersUnderReview = await Paper.find({ reviewerID: req.user.reviewerID })
      //Sending post data from mongodb and user data to ejs template
      res.render("user.ejs", { papersSubmited: papersSubmited, papersUnderReview: papersUnderReview, user: req.user, title: "- Overview" });
      
    } catch (err) {
      console.log(err);
    }
  },
  getAuthor: async (req, res) => {
    try {
      const papers = await Paper.find({ author: req.user.id });
      const submitted = papers.length
      const papersReviewed = papers.filter(i => i.status === "Review Complete")
      const reviews = papersReviewed.length
      const papersInProgress = papers.filter(i => i.status !== "Review Complete")
      //Sending post data from mongodb and user data to ejs template
      res.render("author.ejs", { papersInProgress: papersInProgress, papersReviewed: papersReviewed, user: req.user, submitted: submitted, reviews: reviews, title: "- As Author" });
    } catch (err) {
      console.log(err);
    }
  },
  getReviewer: async (req, res) => {
    try {
      const papersUnderReview = await Paper.find({ reviewerID: req.user.reviewerID, status: "Under Review" })
      const papersReviewed = await Paper.find({ reviewerID: req.user.reviewerID, status: "Review Complete" })
      res.render("reviewer.ejs", { user: req.user, title: "- As Reviewer", papersUnderReview: papersUnderReview, papersReviewed: papersReviewed });
    } catch (err) {
      console.log(err);
    }
  },
  getSettings: async (req, res) => {
    try {
      res.render("settings.ejs", { user: req.user, title: "- Settings" });
    } catch (err) {
      console.log(err);
    }
  },
  updateSettings: async (req, res) => {
    try {
      console.log("*******************************************")
      console.log(req.body)
      let subjects = ["philosopy", "economics", "original", "non-original"]
      let userSubjects = []
      for (const key in req.body){
        if(subjects.includes(key)) userSubjects.push(key)
      }

      console.log("userSubjects")
      console.log(userSubjects)
      console.log("req.user")
      console.log(req.user)
      await User.findOneAndUpdate(
        { _id: req.user },
        {
          title: req.body.title == "" ? req.user.title : req.body.title,
          university: req.body.university == "" ? req.user.university : req.body.university,
          subjects: userSubjects.length ? userSubjects : req.user.subjects,
          
        }
      );
      return res.redirect("/user");
    } catch (err) {
      console.log(err);
    }
  },
};
