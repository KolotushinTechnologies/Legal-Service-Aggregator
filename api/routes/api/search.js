//  Adding basic modules
const express = require("express");
const router = express.Router();

// Initial User Model
const User = require("../../models/User");

// Initial Service Model
const Service = require("../../models/Service");

// Initial Categories Model
const Categories = require("../../models/Categories");

// * @route   GET http://localhost:5000/api/search/test
// * @desc    User route testing
// * @access  Public
router.get("/test", (req, res) => {
  try {
    res.status(200).json({ message: "Search route testing was successfully!" });
  } catch (err) {
    res
      .status(400)
      .json({ message: `Something went wrong, please try again! ${err}` });
  }
});

// * @route   GET http://localhost:5000/api/search
// * @desc    Search users, services, categories
// * @access  Public
router.get("/:keywords", async (req, res) => {
  const keywords = req.params.keywords;

  const keywordRegExp = new RegExp(keywords, "i");

  const users = await User.find({ username: keywordRegExp })
    .select(
      "-password -email -createdAt -updatedAt -favorites -balance -status -role -__v -moneyAtWork"
    )
    .limit(10);

  const services = await Service.find({
    title: keywordRegExp,
    textContent: keywordRegExp,
  }).limit(10);

  const categories = await Categories.find({
    name: keywordRegExp,
  }).limit(10);

  if (!users && !services && !categories) {
    return res.status(404).json({
      status: "error",
      message: "Поиск не дал результатов!",
    });
  }

  return res.status(200).json({
    status: "success",
    message: {
      users,
      services,
      categories,
    },
  });
});

module.exports = router;