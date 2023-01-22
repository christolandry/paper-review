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
  // Displaying a singular paper
  getPaper: async (req, res) => {
    try {
      const paper = await Paper.findOne({ manuscriptNumber: req.params.manuscriptNumber});
      res.render("paper.ejs", { user: req.user, paper: paper, title: `- Paper ${req.params.manuscriptNumber}`});
    } catch (err) {
      console.log(err);
    }
  },

  // Agreeing to review a paper
  postPaper: async (req, res) => {
    try {
      // Find the paper they want to review
      const paper = await Paper.findOne({ manuscriptNumber: req.params.manuscriptNumber});
      
      // If they didn't agree to terms, send them back to the page.
      if(!req.body.hasOwnProperty("agree") || paper.author == req.user.id){
        res.redirect(`paper/${req.params.manuscriptNumber}`);
      }
      
      let review = {
        reviewAccepted: Date.now(),
        reviewCompleted: "",
        reviewerID: req.user.reviewerID,
        reviewerRating: "",
        document: "",
        cloudinaryID: "",
      }

      paper.reviews.push(review)
      paper.status = "Under Review"

      await paper.save();

      //email author that the paper is under review
      
      let author = await User.findOne({ _id: paper.author })
      console.log("------------author------------------")
      console.log(author)
      

      filteredUsers.forEach(user => {
        let authorEmail = author.emailPreferred ? author.emailPreferred : author.email
        client.sendMail(
          {
            from: "paperreviewapp@gmail.com",
            to: authorEmail,
            subject: `Paper Review - Your paper ${paper.title} is now under review`,
            html: `
              A review of your paper, ${paper.title}, is due in one week.
              <br><a href='https://paper-review.vercel.app/user/reviewer'>See all your papers and reviews</a>."
            `,
          }
        )
        console.log(`Email sent to: ${author.email}`)
      })



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
      let disciplines = ['africanaStudies', 
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
      let subDisciplines = []
      for (const key in req.body){
        if(disciplines.includes(key)) subDisciplines.push(key)
      }     

      await Paper.create({
        manuscriptNumber: counter.current,
        title: req.body.title,
        description: req.body.description,
        discipline: req.body.discipline,
        disciplineSub: subDisciplines,
        keywords: req.body.keywords.split(",").map(word => word.trim()),
        feedbackRequested: req.body.feedback,
        document: result.secure_url,
        cloudinaryId: result.public_id,        
        author: req.user.id,
        reviewsRequested: req.body.reviews
      });
      console.log("Paper has been added!");
      
      
      //get all email address that have the subject of the paper being added and send out an email to them.
      
      let users = await User.find()
      let filteredUsers = users.filter(i => i.subjects.includes(covertToCamelCase(req.body.discipline)) && (i.email !== req.user.email))

      filteredUsers.forEach(user => {
        let userEmail = user.emailPreferred ? user.emailPreferred : user.email
        client.sendMail(
          {
            from: "paperreviewapp@gmail.com",
            to: userEmail,
            subject: `Paper Review - A paper titled, '${req.body.title}', of your subject matter has been uploaded`,
            html: `
              A new paper has been uploaded that you are able to review.
              <br>Title: ${req.body.title}
              <br>Discipline: ${req.body.discipline}
              <br>Keywords: ${req.body.keywords}
              <br>Description: ${req.body.description}
              <br>Click this <a href='https://paper-review.vercel.app/papers'>link</a> to view all papers you can review
            `,
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
      console.log("=------------- Step 1 -------------------------")
      // Upload pdf to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);

      console.log("=------------- Step 2 -------------------------")
      //media is stored on cloudainary - the above request responds with url to media and the media id that will be needed when deleting content 
      let paper = await Paper.findOne({ manuscriptNumber: req.params.manuscriptNumber })
      let reviewCount = 1;
      console.log("=------------- Step 3 -------------------------")
      paper.reviews.forEach(review => {
        if(review.reviewerID === req.user.reviewerID){
          review.reviewCompleted = Date.now();
          review.document = result.secure_url;
          review.cloudinaryID = result.public_id;
        } 
        if(review.Completed) reviewCount++
      })
      console.log("=------------- Step 4 -------------------------")
      console.log(`Review Count ${reviewCount}`)
      console.log(`Reviews Requested ${paper.reviewsRequested}`);
      if(reviewCount == paper.reviewsRequested) {
        paper.status = "Review Complete"
        console.log("Status changed");
      }
      // Email author that a paper has been uploaded
      let author = await User.findOne({ _id: paper.author});
      let userEmail = author.emailPreferred ? author.emailPreferred : author.email
      client.sendMail(
        {
          from: "paperreviewapp@gmail.com",
          to: userEmail,
          subject: `Paper Review - A review for ${paper.title} has been completed`,
          html: `
            A review you requested for your paper titled, "${paper.title}", have been completed.
            <br>Click this <a href='https://paper-review.vercel.app/user/author'>link</a> to view the papers you have uploaded.
          `,
        }
      )
      paper.markModified('reviews')
      paper.save()
      console.log("=------------- Step 5 -------------------------")
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
    if (!req.user) {
      return res.redirect("/login");
    }
    try {
      const papers = await Paper.find();
      console.log("------------- Papers Available for Review --------------")
      console.log(papers);
      //Checks are paper is the right discipline, paper needs more reviews, user isn't the author, user hasn't reviewed the paper already
      let filteredPapers = papers.filter(paper => req.user.subjects.includes(covertToCamelCase(paper.discipline.toLowerCase())) 
                                                  && paper.reviews.length < paper.reviewsRequested 
                                                  && req.user.id != paper.author 
                                                  && !paper.reviews.some(review => review.reviewerID == req.user.reviewerID))
      console.log(papers[0].reviews.length)
      console.log(papers[0].reviewsRequested);
      console.log(filteredPapers);
      res.render("papers.ejs", { user: req.user, papers: filteredPapers, title: "- Available Papers" });
    } catch (err) {
      console.log(err);
    }
  }
};

function covertToCamelCase(str){
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
}
