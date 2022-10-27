

module.exports = {
  getAuthor: async (req, res) => {
    try {
      res.render("author.ejs", { user: req.user});
    } catch (err) {
      console.log(err);
    }
  }
};
