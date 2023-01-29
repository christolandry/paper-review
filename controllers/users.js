const Paper = require("../models/Paper");
const User = require("../models/User");

module.exports = {
  getUser: async (req, res) => {
    try {
      //Grabbing just the papers of the logged-in user
      const papersSubmited = await Paper.find({ author: req.user.id });
      const submitted = papersSubmited.length
      
      //Find the time it took to review each paper for the average review time
      let reviewTime = []
      for(let i = 0; i < papersSubmited.length; i++){
        for(let j = 0; j < papersSubmited[i].reviews.length; j++){
          if(papersSubmited[i].reviews[j].reviewCompleted) {
            reviewTime.push(papersSubmited[i].reviews[j].reviewCompleted - papersSubmited[i].reviews[j].reviewAccepted)
          }
        }
      }

      //Grabbing the papers the user has reviewed
      const papersUnderReview = await Paper.find({ reviews: {$elemMatch: {reviewerID: req.user.reviewerID}}})

      let reviewsCompleted = 0;
      let reviewCompleteTime = []
      for(let i = 0; i < papersUnderReview.length; i++){
        for(let j = 0; j < papersUnderReview[i].reviews.length; j++){
          console.log("--------------------------------")
          console.log(papersUnderReview[i].reviews[j].reviewerID === req.user.reviewerID)
          console.log(papersUnderReview[i].reviews[j].reviewCompleted);
          if(papersUnderReview[i].reviews[j].reviewerID === req.user.reviewerID && papersUnderReview[i].reviews[j].reviewCompleted){
            console.log("++++++++++++++++++++++++++++++++++++++")
            reviewsCompleted++
            reviewCompleteTime.push(papersUnderReview[i].reviews[j].reviewCompleted - papersUnderReview[i].reviews[j].reviewAccepted)
          }
        }
      }
      console.log("Review Complete Time");
      console.log(reviewCompleteTime)
      console.log(reviewCompleteTime.map(i => i / (1000 * 60 * 60 * 24)));
      console.log(reviewCompleteTime.map(i => i / (1000 * 60 * 60 * 24)).reduce((acc, cur) => acc += cur, 0));
      console.log((reviewCompleteTime.map(i => i / (1000 * 60 * 60 * 24)).reduce((acc, cur) => acc += cur, 0)/reviewCompleteTime.length));

      //Sending post data from mongodb and user data to ejs template
      res.render("user.ejs", { papersSubmited: papersSubmited.reverse(), 
                               inProgress: getInProgress(papersSubmited), 
                               papersUnderReview: papersUnderReview.reverse(), 
                               submitted: submitted, 
                               numberOfReviews: reviewTime.length, 
                               reviewTime: reviewTime.map(i => i / (1000 * 60 * 60 * 24)).reduce((acc, cur) => acc += cur, 0)/reviewTime.length, 
                               reviewsCompleted: reviewsCompleted,
                               reviewCompleteTime: reviewCompleteTime.map(i => i / (1000 * 60 * 60 * 24)).reduce((acc, cur) => acc += cur, 0)/reviewCompleteTime.length, 
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

      //Sending post data from mongodb and user data to ejs template
      res.render("author.ejs", { papersReviewed: papersReviewed.reverse(), 
                                 inProgress: getInProgress(papers), 
                                 user: req.user, 
                                 submitted: submitted, 
                                 title: "- As Author" });
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


      let completedReviews = []

      papersReviewed.forEach(paper => {
        paper.reviews.forEach((review, index) => {
          if(review.reviewerID == req.user.reviewerID){
            let currentReview = {}
            currentReview.title = paper.title
            currentReview.reviewAccepted = new Date(review.reviewAccepted)
            currentReview.reviewCompleted = new Date(review.reviewCompleted)
            currentReview.duration = Math.floor((currentReview.reviewCompleted - currentReview.reviewAccepted) / (1000 * 60 * 60 * 24))
            currentReview.document = review.document
            completedReviews.push(currentReview)
          }
        })
      })

      res.render("reviewer.ejs", { user: req.user, 
                                   title: "- As Reviewer", 
                                   papersUnderReview: papersUnderReview, 
                                   completedReviews: completedReviews.sort((a,b) => b.reviewCompleted - a.reviewCompleted)});
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

function getInProgress(papers){
  const papersInProgress = papers.filter(i => i.status !== "Review Complete")
  let inProgress = []
  console.log(papersInProgress)
  papersInProgress.forEach(paper => {
    paper.reviews.forEach((review, index) =>{
      if(!review.document){
        let current = {}
        current.title = paper.title
        current.document = paper.document
        current.status = "Under Review"
        current.submitted = new Date(paper.createdAt)
        current.reviewAccepted = new Date(review.reviewAccepted)
        current.duration = Math.floor((new Date() - current.reviewAccepted) / (1000 * 60 * 60 * 24))
        current.number = `${index + 1} / ${paper.reviewsRequested}`
        current.reviewerID = review.reviewerID
        current.manuscriptNumber = paper.manuscriptNumber
        inProgress.push(current)
      }
    })
    //if there are reviews requested outstanding that haven't been picked up yet
    if(paper.reviewsRequested - paper.reviews.length){
      let current = {}
      current.title = paper.title
      current.document = paper.document
      current.status = "Awaiting Reviewer"
      current.submitted = new Date(paper.createdAt)
      current.number = `${paper.reviews.length + 1} / ${paper.reviewsRequested}`
      current.manuscriptNumber = paper.manuscriptNumber
      inProgress.push(current)
    }
  })

  inProgress.sort((a,b) => {
    if(a.status < b.status) return 1;
    if(a.status > b.status) return -1;
    if(a.reviewAccepted > b.reviewAccepted) return 1
    if(a.reviewAccepted < b.reviewAccepted) return -1
    return 0;
   })

   return inProgress
}