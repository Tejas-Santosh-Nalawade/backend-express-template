import { body } from "express-validator";

// can be used  as the template to use it any where for validations production ready

const userRegistrationValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required.")
      .isEmail()
      .withMessage("Please provide a valid email address."),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required.")
      .isLowercase()
      .withMessage("Username must be lowercase.")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3  characters long."),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required.")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long."),
    body("role")
      .trim()
      .notEmpty()
      .withMessage("Role is required.")
      .isIn(["user", "admin"])
      .withMessage('Role must be either "user" or "admin".'),
  ];
};

const userLoginValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required.")
      .isEmail()
      .withMessage("Please provide a valid email address."),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required.")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long."),
  ];
};

export { userRegistrationValidator, userLoginValidator };
