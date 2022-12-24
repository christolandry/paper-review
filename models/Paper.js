const mongoose = require("mongoose");

const PaperSchema = new mongoose.Schema({
  //----- Paper Information ----------
  manuscriptNumber: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: "Awaiting Reviewer",
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  discipline: {
    type: String,
    required: true,
  },
  disciplineSub: {
    type: Array,
    required: true,
  },
  keywords: {
    type: Array,
    required: true,
  },
  feedbackRequested: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  //----- Paper PDF Storage ----------
  document: {
    type: String,
    require: true,
  },
  cloudinaryId: {
    type: String,
    require: true,
  },
  //----- Review Information ---------
  reviews: {
    type: [Object], //each review is: {reviewAccepted, reviewCompleted, reviewerID, reviewRating, document, cloudinaryID}
    default: [],
  },
  reviewsRequested: {
    type: Number,
    required: true,
  },
  // Old review information when there was only one review per paper
  // reviewAccepted: {
  //   type: Date,
  //   default: "",
  // },
  // reviewCompleted: {
  //   type: Date,
  //   default: "",
  // },
  // reviewerID: {
  //   type: Number,
  //   default: "",
  // },
  // reviewRating: {
  //   type: Number,
  //   default: "",
  // },
  //----- Review PDF Storage ----------
  // documentReview: {
  //   type: String,
  //   default: "",
  // },
  // cloudinaryIdReview: {
  //   type: String,
  //   default: "",
  // },
});

//MongoDB Collection named here - will give lowercase plural of name 
module.exports = mongoose.model("Papers", PaperSchema);