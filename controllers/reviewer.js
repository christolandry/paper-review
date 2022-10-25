

module.exports = {
  getPost: async (req, res) => {
    try {
      res.render("reviewer.ejs", { user: req.user});
    } catch (err) {
      console.log(err);
    }
  }
};
