const Paper = require("../models/Paper");

module.exports = {
  getUser: async (req, res) => {
    try {
      //Grabbing just the papers of the logged-in user
      const papers = await Paper.find({ author: req.user.id });
      //Sending post data from mongodb and user data to ejs template
      res.render("user.ejs", { papers: papers, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getAuthor: async (req, res) => {
    try {
      const papers = await Paper.find({ author: req.user.id });
      const submitted = papers.length
      const reviews = papers.filter(i => i.reviewerID).length
      //Sending post data from mongodb and user data to ejs template
      res.render("author.ejs", { papers: papers, user: req.user, submitted: submitted, reviews: reviews });
    } catch (err) {
      console.log(err);
    }
  },
  getReviewer: async (req, res) => {
    try {
      res.render("reviewer.ejs", { user: req.user});
    } catch (err) {
      console.log(err);
    }
  },
};
