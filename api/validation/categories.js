const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateCategoryInput(data) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : "";

  if (Validator.isEmpty(data.name)) {
    errors.name = "Category name field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
