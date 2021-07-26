const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateFavoritesInput(data) {
  let errors = {};

  data.favoriteUser = !isEmpty(data.favoriteUser) ? data.favoriteUser : "";

  if (Validator.isEmpty(data.favoriteUser)) {
    errors.favoriteUser = "Favorite user field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
