const mongoose = require("mongoose");

const PaperSchema = new mongoose.Schema({
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
  type: {
    type: String,
    required: true,
  },
  document: {
    type: String,
    require: true,
  },
  cloudinaryId: {
    type: String,
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  reviewAccepted: {
    type: Date,
    default: "",
  },
  reviewerID: {
    type: Number,
    default: "",
  },
});

//MongoDB Collection named here - will give lowercase plural of name 
module.exports = mongoose.model("Papers", PaperSchema);