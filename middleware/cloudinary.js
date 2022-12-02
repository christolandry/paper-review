const cloudinary = require("cloudinary").v2;

// require("dotenv").config({ path: "./config/.env" });
// require("dotenv").config({ path: "./.env" });

cloudinary.config({
  // cloud_name: 'dy1dtpv72',
  cloud_name: process.env.CLOUD_NAME,
  // api_key: '341219585238167',
  api_key: process.env.API_KEY,
  // api_secret: 'NA8dfaD_tqeFlfJGIXwDpdMK98U',
  api_secret: process.env.API_SECRET,
  secure: true,
});

module.exports = cloudinary;
