import { Router } from "express";
import { registerUser} from "../controllers/auth.controllers.js";

import { validate } from "../middlewares/validator.middleware.js";    

import { userRegistrationValidator } from "../validators/index.js";

import { userLoginValidator } from "../validators/index.js";

import { loginUser } from "../controllers/auth.controllers.js";
import { logoutUser } from "../controllers/auth.controllers.js";


import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();


// In this route, we use the userRegistrationValidator to validate the incoming request data for user registration.

// and the validate middleware to check for validation errors before proceeding to the registerUser controller.

// Here userRegistrationValidator() returns an array of validation chains that check the email, username, password, and role fields in the request body. its and method 

// Validate middleware processes the results of these validations and sends a response with errors if any validations fail. If all validations pass, the registerUser controller is called to handle the registration logic. 

// next is the function that moves to the next middleware or controller in the stack.

// Route: POST /api/v1/auth/register
router.route('/register').post(userRegistrationValidator(), validate, registerUser);

// Route: POST /api/v1/auth/login

router.route('/login').post(userLoginValidator(), validate, loginUser);

// Route: POST /api/v1/auth/logout

// Protected / Secure Route
router.route('/logout').post(verifyJWT, logoutUser);

export default router;