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
  reviewAccepted: {
    type: Date,
    default: "",
  },
  reviewCompleted: {
    type: Date,
    default: "",
  },
  reviewerID: {
    type: Number,
    default: "",
  },
  reviewRating: {
    type: Number,
    default: "",
  },
  //----- Review PDF Storage ----------
  documentReview: {
    type: String,
    default: "",
  },
  cloudinaryIdReview: {
    type: String,
    default: "",
  },
});

//MongoDB Collection named here - will give lowercase plural of name 
module.exports = mongoose.model("Papers", PaperSchema);