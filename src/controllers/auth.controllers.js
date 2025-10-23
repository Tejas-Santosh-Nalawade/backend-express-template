import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { emailVerificationMailgenContent, sendEmail } from "../utils/mail.js";
import jwt from "jsonwebtoken";

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshTokens = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  // ✅ Check if email or username already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with this email or username already exists");
  }

  // ✅ Create new user
  const user = await User.create({
    email,
    username,
    password,
    isEmailVerified: false,
  });

  // ✅ Generate verification token
  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryTokens();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationTokenExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  // ✅ Send verification email
  await sendEmail({
    email: user.email,
    subject: "Verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
    ),
  });

  // ✅ Filter user data for response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshTokens -emailVerificationToken -emailVerificationTokenExpiry"
  );

  if (!createdUser) {
    throw new ApiError(500, "Error creating user");
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      { user: createdUser },
      "User registered successfully. Please verify your email to activate your account."
    )
  );
});

const loginUser = asyncHandler(async (req, res) => {
   const { email, password , username } = req.body;
   // user can login with email or username
   if(!email){
    throw new ApiError(400, "Email is required for login");
   }

  const user = await  User.findOne({email});

  if(!user){
    throw new ApiError(401, "Invalid email or password");
  } 

  const isPasswordValid = await user.isPasswordCorrect(password);


  if(!isPasswordValid){
    throw new ApiError(401, "Invalid Credentials");
  }


  const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id);

  // Logged in user data filtering
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshTokens -emailVerificationToken -emailVerificationTokenExpiry"
  );


  // Set tokens in HttpOnly cookies


  const cookieOptions = {
    httpOnly: true,
    secure: true,

  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});


const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { $set: { refreshTokens: "" } }, { new: true });


    const cookieOptions = { 
      httpOnly: true,
      secure: true,
    }

    return res
      .status(200)
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .json(new ApiResponse(200, null, "User logged out successfully"));
});





export { registerUser , loginUser , logoutUser };
