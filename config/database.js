const mongoose = require("mongoose");

require("dotenv").config({ path: "./.env" });
 
const connectDB = async () => {
  try {
    const connectionString = process.env.MONGODB_URI ? process.env.MONGODB_URI : process.env.DB_STRING
    const conn = await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;
