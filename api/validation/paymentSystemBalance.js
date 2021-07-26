const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validatePaymentSystemBalanceInput(data) {
  let errors = {};

  data.replenishmentAmount = !isEmpty(data.replenishmentAmount)
    ? data.replenishmentAmount
    : "";

  if (Validator.isEmpty(data.replenishmentAmount)) {
    errors.replenishmentAmount = "replenishmentAmount field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
