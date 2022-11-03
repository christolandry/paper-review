module.exports = {
  getIndex: (req, res) => {
    res.render("index.ejs", { user: 0});
  },
};
