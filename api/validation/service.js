const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateServiceInput(data) {
  let errors = {};

  data.title = !isEmpty(data.title) ? data.title : "";
  data.textContent = !isEmpty(data.textContent) ? data.textContent : "";
  data.categories = !isEmpty(data.categories) ? data.categories : "";

  if (Validator.isEmpty(data.title)) {
    errors.title = "Service title field is required";
  }

  if (Validator.isEmpty(data.textContent)) {
    errors.textContent = "Text Content field is required";
  }

  if (Validator.isEmpty(data.categories)) {
    errors.categories = "Categories field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
