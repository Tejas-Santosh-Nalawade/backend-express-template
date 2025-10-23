import { Router } from "express";
import { changeCurrentPassword, forgotPasswordRequest, getCurrentUser, refreshAccessToken, registerUser, resendEmailVerification, resetForgotPassword, verifyEmail } from "../controllers/auth.controllers.js";

import { validate } from "../middlewares/validator.middleware.js";

import { userChangeCurrentPasswordValidator, userForgotPasswordValidator, userRegistrationValidator, userResetForgotPasswordValidator } from "../validators/index.js";


import { userLoginValidator } from "../validators/index.js";

import { loginUser } from "../controllers/auth.controllers.js";
import { logoutUser } from "../controllers/auth.controllers.js";


import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// In this route, we use the userRegistrationValidator to validate the incoming request data for user registration.

// and the validate middleware to check for validation errors before proceeding to the registerUser controller.

// Here userRegistrationValidator() returns an array of validation chains that check the email, username, password, and role fields in the request body. its and method

// Validate middleware processes the results of these validations and sends a response with errors if any validations fail. If all validations pass, the registerUser controller is called to handle the registration logic.

// next is the function that moves to the next middleware or controller in the stack.

// Unsecured Route

// Route: POST /api/v1/auth/register
router
  .route("/register")
  .post(userRegistrationValidator(), validate, registerUser);

// Route: POST /api/v1/auth/login

router.route("/login").post(userLoginValidator(), validate, loginUser);

// Route: GET /api/v1/auth/verify-email/:verificationToken
router.route("/verify-email/:verificationToken").get(verifyEmail);


// Route: GET /api/v1/auth/refresh-token
router.route("/refresh-token").post(refreshAccessToken);

// Route: POST /api/v1/auth/forgot-password
router.route("/forgot-password").post(userForgotPasswordValidator(), validate, forgotPasswordRequest);

router.route("/reset-password/:resetToken").post(userResetForgotPasswordValidator(), validate, resetForgotPassword);

// Route: POST /api/v1/auth/logout

// Protected / Secure Route
router.route("/logout").post(verifyJWT, logoutUser);

// Route: POST /api/v1/auth/current-user
router.route("/current-user").post(verifyJWT, getCurrentUser);

// Route: POST /api/v1/auth/change-password

router.route("/change-password").post(verifyJWT,userChangeCurrentPasswordValidator(), validate, changeCurrentPassword);

router.route("/resend-email-verification").post(verifyJWT, resendEmailVerification);

export default router;
 