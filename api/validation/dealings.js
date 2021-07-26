const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateDealingsInput(data) {
  let errors = {};

  data.transactionAmount = !isEmpty(data.transactionAmount)
    ? data.transactionAmount
    : "";
  data.termsOfAtransaction = !isEmpty(data.termsOfAtransaction)
    ? data.termsOfAtransaction
    : "";

  if (Validator.isEmpty(data.transactionAmount)) {
    errors.transactionAmount = "transactionAmount field is required";
  }

  if (Validator.isEmpty(data.termsOfAtransaction)) {
    errors.termsOfAtransaction = "termsOfAtransaction field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
