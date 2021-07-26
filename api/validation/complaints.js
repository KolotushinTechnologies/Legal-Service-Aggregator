const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateComplaintsInput(data) {
  let errors = {};

  data.textComplaining = !isEmpty(data.textComplaining)
    ? data.textComplaining
    : "";

  if (Validator.isEmpty(data.textComplaining)) {
    errors.textComplaining = "Complaints textComplaining field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
