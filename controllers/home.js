module.exports = {
  getIndex: (req, res) => {
    res.render("index.ejs", {user: req.user, title: ""});
  },
  getFAQ: (req, res) => {
    res.render("faq.ejs", {user: req.user, title: " - FAQ"});
  },
};
