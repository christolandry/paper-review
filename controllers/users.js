const Paper = require("../models/Paper");
const User = require("../models/User");

module.exports = {
  getUser: async (req, res) => {
    try {
      //Grabbing just the papers of the logged-in user
      const papersSubmited = await Paper.find({ author: req.user.id });
      const papersUnderReview = await Paper.find({ reviews: {$elemMatch: {reviewerID: req.user.reviewerID}}})
      console.log("++++++++++++++++++++++++++++++++++++++++++++")
      console.log("++++++++++++++++++++++++++++++++++++++++++++")
      console.log(papersUnderReview)
      console.log("++++++++++++++++++++++++++++++++++++++++++++")
      console.log("++++++++++++++++++++++++++++++++++++++++++++")
      //Sending post data from mongodb and user data to ejs template
      res.render("user.ejs", { papersSubmited: papersSubmited, papersUnderReview: papersUnderReview, user: req.user, title: "- Overview" });
      
    } catch (err) {
      console.log(err);
    }
  },
  getAuthor: async (req, res) => {
    try {
      const papers = await Paper.find({ author: req.user.id });
      // console.log(papers)
      const submitted = papers.length
      const papersReviewed = papers.filter(paper => {
        if(paper.status === "Review Complete") return true
        if(paper.reviews.length){
          for(let review = 0; review < paper.reviews.length; review++){
            if(paper.reviews[review].reviewCompleted) return true
          }
        }
        return false
      })
      const reviews = papersReviewed.length
      const papersInProgress = papers.filter(i => i.status !== "Review Complete")
      // console.log("-------------------------")
      // console.log("-------------------------")
      // console.log("-------------------------")
      // console.log(papersInProgress)
      // console.log(`Papers In Progress Length: ${papersInProgress.length}`)
      //Sending post data from mongodb and user data to ejs template
      res.render("author.ejs", { papersInProgress: papersInProgress, papersReviewed: papersReviewed, user: req.user, submitted: submitted, title: "- As Author" });
    } catch (err) {
      console.log(err);
    }
  },
  getReviewer: async (req, res) => {
    try {

      let papersUnderReview = await Paper.find({ reviews: {$elemMatch: {reviewerID: req.user.reviewerID, document: ""}}})
      let papersReviewed = await Paper.find({ reviews: {$elemMatch: {reviewerID: req.user.reviewerID, document: {$ne: ""}}}})

      reviewLookupUnderReview = []
      papersUnderReview.forEach(paper => {
        paper.reviews.forEach((review, index) => {
          if(review.reviewerID == req.user.reviewerID){
            reviewLookupUnderReview.push(index)
          }
        })
      })

      reviewLookupReviewed = []
      papersReviewed.forEach(paper => {
        paper.reviews.forEach((review, index) => {
          if(review.reviewerID == req.user.reviewerID){
            reviewLookupReviewed.push(index)
          }
        })
      })

      res.render("reviewer.ejs", { user: req.user, title: "- As Reviewer", papersUnderReview: papersUnderReview, reviewLookupUnderReview: reviewLookupUnderReview, reviewLookupReviewed: reviewLookupReviewed, papersReviewed: papersReviewed });
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
      let subjects = ['africanaStudies', 
                      'anthropology',
                      'artHistory',
                      'biology',
                      'business',
                      'chemistry',
                      'classics',
                      'communications',
                      'comparativeLiterature',
                      'computerScience',
                      'dance',
                      'data Science',
                      'earthAndEnvironmentalSciences',
                      'economics',
                      'education',
                      'english',
                      'geology',
                      'history',
                      'law',
                      'languageAndCulture',
                      'linguistics',
                      'mathematics',
                      'music',
                      'philosophy',
                      'physics',
                      'politicalScience',
                      'psychology',
                      'publicPolicy',
                      'religiousStudies',
                      'sociology',
                      'theaterAndPerformance']
      let userSubjects = []
      for (const key in req.body){
        if(subjects.includes(key)) userSubjects.push(key)
      }
      await User.findOneAndUpdate(
        { _id: req.user },
        {
          title: req.body.title == "" ? req.user.title : req.body.title,
          university: req.body.university == "" ? req.user.university : req.body.university,
          subjects: userSubjects.length ? userSubjects : req.user.subjects,
          discipline: req.body.discipline == "" ? req.user.discipline : req.body.discipline,
          email: req.body.email == "" ? req.user.email : req.body.email,
          emailPreferred: req.body.emailPreferred == "" ? req.user.emailPreferred : req.body.emailPreferred,
        }
      );
      return res.redirect("/user");
    } catch (err) {
      console.log(err);
    }
  },
};
