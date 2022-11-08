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
  getPaper: async (req, res) => {
    try {
      const paper = await Paper.findOne({ manuscriptNumber: req.params.manuscriptNumber});
      res.render("paper.ejs", { user: req.user, paper: paper, title: `- Paper ${req.params.manuscriptNumber}`});
    } catch (err) {
      console.log(err);
    }
  },
  postPaper: async (req, res) => {
    try {
      const paper = await Paper.findOne({ manuscriptNumber: req.params.manuscriptNumber});
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
      console.log("***************** Check 1 ****************")
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
      console.log("***************** Check 2 ****************")
      for (const key in req.body){
        if(disciplines.includes(key)) subDisciplines.push(key)
      }     
      console.log("***************** Check 3 ****************")
      await Paper.create({
        manuscriptNumber: counter.current,
        title: req.body.title,
        discipline: req.body.discipline,
        disciplineSub: subDisciplines,
        description: req.body.description,
        keywords: req.body.keywords.split(",").forEach(word => word.trim()),
        feedback: req.body.feedback,
        document: result.secure_url,
        cloudinaryId: result.public_id,        
        author: req.user.id,
      });
      console.log("Paper has been added!");
      //get all email address that have the subject of the paper being added and send out an email to them.
      
      let users = await User.find()
      console.log("Users")
      console.log(users)
      let filteredUsers = users.filter(i => i.subjects.includes(covertToCamelCase(req.body.discipline)) && (i.email !== req.user.email))
      console.log("***************** Check 1 ****************")
      console.log("Filtered Users")
      console.log(filteredUsers)

      filteredUsers.forEach(user => {
        let userEmail = user.emailPreferred ? user.emailPreferred : user.email
        client.sendMail(
          {
            from: "paperreviewapp@gmail.com",
            to: userEmail,
            subject: "Paper Review - A new paper of your subject matter has been uploaded",
            html: `
              A new paper has been uploaded that you are able to review.
              <br>Title: ${req.body.title}
              <br>Discipline: ${req.body.discipline}
              <br>Sub-Discipline(s): ${subDisciplines.join(", ")}
              <br>Keywords: ${req.body.keywords}
              <br>description: ${req.body.description}
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
      // Upload pdf to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);
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
      let filteredPapers = papers.filter(paper => req.user.subjects.includes(covertToCamelCase(paper.discipline.toLowerCase())))
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
