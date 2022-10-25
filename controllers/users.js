

module.exports = {
  getPost: async (req, res) => {
    try {
      res.render("user.ejs", { user: req.user});
    } catch (err) {
      console.log(err);
    }
  }
};
