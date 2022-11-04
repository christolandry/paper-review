const mongoose = require("mongoose");

const ReviewerIDCounterSchema = new mongoose.Schema({
  title: {
    type: String,
    default: "counter"
  },
  current: {
    type: Number,
    required: true,
  },
});

//MongoDB Collection named here - will give lowercase plural of name 
module.exports = mongoose.model("ReveiewerIDCounter", ReviewerIDCounterSchema);