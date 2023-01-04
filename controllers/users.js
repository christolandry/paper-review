const Paper = require("../models/Paper");
const User = require("../models/User");

module.exports = {
  getUser: async (req, res) => {
    try {
      //Grabbing just the papers of the logged-in user
      const papersSubmited = await Paper.find({ author: req.user.id });
      const submitted = papersSubmited.length
      let numberOfReviews = 0;
      let reviewTime = []
      for(let i = 0; i < papersSubmited.length; i++){
        for(let j = 0; j < papersSubmited[i].reviews.length; j++){
          if(papersSubmited[i].reviews[j].reviewCompleted) {
            numberOfReviews++
            reviewTime.push(papersSubmited[i].reviews[j].reviewCompleted - papersSubmited[i].reviews[j].reviewAccepted)
          }
        }
      }
      //Grabbing papers that have this user as one of the reviewers
      const papersUnderReview = await Paper.find({ reviews: {$elemMatch: {reviewerID: req.user.reviewerID}}})

      let reviewsCompleted = 0;
      let reviewCompleteTime = []
      for(let i = 0; i < papersUnderReview; i++){
        for(let j = 0; j < papersUnderReview[i].reviews.length; j++)
          if(papersUnderReview[i].reviews[j].reviewerID === req.user.reviewerID && papersUnderReview[i].reviews[j].reviewCompleted){
            reviewsCompleted++
            reviewCompleteTime.push(papersUnderReview[i].reviews[j].reviewCompleted - papersUnderReview[i].reviews[j].reviewAccepted)
          }
      }

      console.log(reviewCompleteTime)
      //Sending post data from mongodb and user data to ejs template
      res.render("user.ejs", { papersSubmited: papersSubmited.reverse(), 
                               papersUnderReview: papersUnderReview.reverse(), 
                               submitted: submitted, 
                               numberOfReviews: numberOfReviews, 
                               reviewTime: reviewTime.reduce((acc, cur) => acc += cur, 0)/reviewTime.length, 
                               reviewsCompleted: reviewsCompleted,
                               reviewCompleteTime: reviewCompleteTime.reduce((acc, cur) => acc += cur, 0)/reviewCompleteTime.length, 
                               user: req.user, 
                               title: "- Overview" });
      
    } catch (err) {
      console.log(err);
    }
  },
  getAuthor: async (req, res) => {
    try {
      const papers = await Paper.find({ author: req.user.id });
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

      //Sending post data from mongodb and user data to ejs template
      res.render("author.ejs", { papersInProgress: papersInProgress.reverse(), papersReviewed: papersReviewed.reverse(), user: req.user, submitted: submitted, title: "- As Author" });
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

      reviewLookupReviewed = [] //which reivew for each paper is the one done by this user
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
