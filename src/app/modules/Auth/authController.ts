/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction, RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { TokenPayload, sendResponse } from '../../../interface/Payload';
import { UserModel } from '../user/user.model';
import config from '../../../config';
import catchAsync from '../../../utils/catchAsync';
import { hashedPassword } from '../../../helper/PasswordHelpers';
import { publishToChannel, redisClient } from '../../../config/configureRedis';
import { JwtPayload } from 'jsonwebtoken';
import { sendImageToCloudinary } from '../../../utils/sendImageToCloudinary';

//.........................register ..................................

// Route handler for user registration
export const register: RequestHandler = catchAsync(async (req, res) => {
  const {
    username,
    password,
    email,
    role,
    gender,
    phoneNumber,
    address,
    age,
    country,
  } = req.body;

  // Check if the password meets the minimum length requirement
  if (password.length < 6) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: 'Password must be at least 6 characters long',
      data: null,
    });
  }

  // Check if the password contains at least one uppercase letter and one lowercase letter
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message:
        'Password must contain at least one uppercase letter and one lowercase letter',
      data: null,
    });
  }

  // Check if the username is already taken
  const existingUser = await UserModel.findOne({ username });
  if (existingUser) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: 'Username is already taken',
      data: null,
    });
  }

  // Check if the email is already in use
  const existingUserEmail = await UserModel.findOne({ email });
  if (existingUserEmail) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: 'This email is already in use',
      data: null,
    });
  }

  // Check if the username starts with an uppercase letter
  if (!/^[A-Z]/.test(username)) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: 'Username must start with an uppercase letter',
      data: null,
    });
  }

  // Hash the password
  const hashedPasswordValue = await hashedPassword(password);

  let userImage;
  if (req.file) {
    // If a file is uploaded, upload it to Cloudinary
    const imageName = req.file.originalname;
    const imagePath = req.file.path;
    const result = await sendImageToCloudinary(imageName, imagePath);
    userImage = result.secure_url; // Store the secure URL of the uploaded image
  }

  // Create a new user
  const newUser = new UserModel({
    username,
    password: hashedPasswordValue,
    email,
    userImage, // Assign the user image URL here
    gender,
    phoneNumber,
    address,
    age,
    country,
    role: role || 'user', // Set a default role if not provided
  });

  await newUser.save();

  // Generate a token for the newly registered user
  const token = jwt.sign(
    {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    },
    config.jwt.secret as string,
  );

  await publishToChannel('user_registered', { username: newUser.username });

  // Respond with success message and user data
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'User registered successfully',
    data: {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      userImage: newUser.userImage,
      gender: newUser.gender,
      phoneNumber: newUser.phoneNumber,
      address: newUser.address,
      age: newUser.age,
      country: newUser.country,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    },
  });
});
//.......................login..................................
export const login: RequestHandler = catchAsync(async (req, res) => {
  const { username, password } = req.body;

  // Fetch the user from the database based on the provided username
  const user = await UserModel.findOne({ username });

  if (user) {
    // User is found, now check the password
    if (await bcrypt.compare(password, user.password)) {
      // User is authenticated

      // Additional user data to include in the token payload
      const { _id, email, role } = user;

      // Combine user data and additional data in the payload
      const tokenPayload = { _id, username: user.username, email, role };

      // Sign the access token
      const accessToken = jwt.sign(tokenPayload, config.jwt.secret as string, {
        expiresIn: config.jwt.expires_in as string,
      });

      // Sign the refresh token
      const refreshToken = jwt.sign(
        tokenPayload,
        config.jwt.refresh_secret as string,
        { expiresIn: config.jwt.refresh_expires_in as string },
      );

      // Set the access token as a cookie
      res.cookie('token', accessToken, {
        httpOnly: true,
        maxAge: 3600000, // Access token expires in 1 hour
      });

      // Set the refresh token as a separate cookie
      res.cookie('refreshToken', refreshToken, {
        secure: config.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // Refresh token expires in 7 days
      });

      // Publish a message to Redis channel after successful login
      await redisClient.publish('user_logged_in', JSON.stringify(user));

      sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'User login successful',
        data: {
          user: { _id, username: user.username, email, role },
          accessToken,
        },
      });
    } else {
      // Incorrect password
      sendResponse(res, {
        success: false,
        statusCode: 401,
        message: 'Incorrect password',
        data: null,
      });
    }
  } else {
    // User not found by username
    sendResponse(res, {
      success: false,
      statusCode: 401,
      message: 'Incorrect username',
      data: null,
    });
  }
});
//.........................logout..................................
export const logout: RequestHandler = catchAsync(async (req, res) => {
  // Clear the token cookie
  res.clearCookie('token');

  // Send response to client
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User logged out successfully',
    data: null,
  });
});

//..........................refreshToken ................................
export const refreshToken: RequestHandler = catchAsync(async (req, res) => {
  try {
    // Extract the refresh token from the request cookies
    const refreshToken = req.cookies.refreshToken;

    // Verify the refresh token
    const decodedToken = jwt.verify(
      refreshToken,
      config.jwt.refresh_secret as string,
    ) as TokenPayload;

    // Fetch the user from the database based on the ID in the decoded token
    const user = await UserModel.findById(decodedToken._id);

    if (user) {
      // Additional user data to include in the new access token payload
      const { _id, username, email, role } = user;

      // Create a new access token
      const newAccessToken = jwt.sign(
        { _id, username, email, role },
        config.jwt.secret as string,
        { expiresIn: config.jwt.expires_in as string },
      );

      // Publish a message to the 'token_refreshed' channel
      await publishToChannel('token_refreshed', { userId: user._id });

      // Send the new access token as a cookie
      res.cookie('token', newAccessToken, {
        httpOnly: true,
        maxAge: 3600000, // New access token expires in 1 hour
      });

      // Send a response indicating success
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Access token is retrieved successfully!',
        data: { user: { _id, username, email, role }, newAccessToken },
      });
    } else {
      // User not found by ID
      sendResponse(res, {
        success: false,
        statusCode: 401,
        message: 'Invalid refresh token',
        data: null,
      });
    }
  } catch (error) {
    // Send an error response
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: 'Error refreshing token',
      data: null,
    });
  }
});
//..........................change pass ................................
const PASSWORD_HISTORY_LIMIT = 2;

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { currentPassword, newPassword } = req.body;

  const user = req.user as JwtPayload;
  const { _id } = user;

  try {
    const user = await UserModel.findById(_id);
    if (!user) {
      return sendResponse(res, {
        success: false,
        statusCode: 404,
        message: 'User not found',
        data: null,
      });
    }

    // Check if the current password is correct
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      return sendResponse(res, {
        success: false,
        statusCode: 400,
        message: 'Current password is incorrect',
        data: null,
      });
    }

    // Check if the new password is different from the current one
    const isNewPasswordDifferent = await bcrypt.compare(
      newPassword,
      user.password,
    );

    if (isNewPasswordDifferent) {
      return sendResponse(res, {
        success: false,
        statusCode: 400,
        message: 'New password must be different from the current password',
        data: null,
      });
    }

    // Check if the new password is not among the last N used
    const lastNPasswords = user.passwordChangeHistory.slice(
      -PASSWORD_HISTORY_LIMIT,
    );

    for (const entry of lastNPasswords) {
      const isPasswordUsed = await bcrypt.compare(newPassword, entry.password);

      if (isPasswordUsed) {
        return sendResponse(res, {
          success: false,
          statusCode: 400,
          message: `Password change failed. Ensure the new password is unique and not among the last ${PASSWORD_HISTORY_LIMIT} used (last used on ${entry.timestamp}).`,
          data: null,
        });
      }
    }

    // Hash the new password and update the user
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;

    // Add the new password to the change history
    user.passwordChangeHistory.push({
      password: hashedNewPassword,
      timestamp: new Date(),
    });

    // Save the updated user in the database
    await user.save();

    // Publish a message to the 'password_changed' channel
    await publishToChannel('password_changed', { userId: user._id });

    // Respond with the updated user data
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'Password changed successfully',
      data: {
        _id: user._id,
        email: user.email,
        name: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    // Pass the error to the error handling middleware
    next(error);
  }
};
