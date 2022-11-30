const express = require("express");
const app = express();
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const methodOverride = require("method-override");
const flash = require("express-flash");
const logger = require("morgan");
const connectDB = require("./config/database");
const mainRoutes = require("./routes/main");
const userRoutes = require("./routes/user");
const papersRoutes = require("./routes/papers");
const postRoutes = require("./routes/posts");
const path = require('path'); //added for Vercel

//Use .env file in config folder
// require("dotenv").config({ path: "./config/.env" });
// require("dotenv").config({ path: "./.env" });

// Passport config
require("./config/passport")(passport);

//Connect To Database
connectDB();

//Using EJS for views
app.set("view engine", "ejs");

//Static Folder
app.use(express.static("public"));
app.set("views", path.join(__dirname, "views")) //added for Vercel
app.set("public", path.join(__dirname, "public")) //added for Vercel

//Body Parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Logging
app.use(logger("dev"));

//Use forms for put / delete
app.use(methodOverride("_method"));

// Setup Sessions - stored in MongoDB
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    // cookie: { maxAge: 1000 * 60 * 60} //1000 miliseconds x 60 seconds x 60 min for 1 hour total
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Use flash messages for errors, info, ect...
app.use(flash());

//Setup Routes For Which The Server Is Listening
app.use("/", mainRoutes);
app.use("/user", userRoutes);
app.use("/papers", papersRoutes);
app.use("/post", postRoutes);

//Server Running
app.listen(process.env.PORT, () => {
  console.log("Server is running, you better catch it!");
});
