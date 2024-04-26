/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import { RequestHandler } from 'express';
import { IUser, UserModel } from '../modules/user/user.model';
import catchAsync from '../../utils/catchAsync';
import { paginationHelpers } from '../../helper/paginationHelpers';

import { JwtPayload } from 'jsonwebtoken';
import { redisClient } from '../../config/configureRedis';

export const getAllUsers: RequestHandler = catchAsync(async (req, res) => {
  const { page, limit, sortBy, sortOrder } = req.query;
  const cacheKey = `allUsers:${page}:${limit}:${sortBy}:${sortOrder}`;

  // Check if the data exists in the cache
  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    // If cached data exists, send it as response
    const parsedData = JSON.parse(cachedData);
    return res.status(200).json(parsedData);
  }

  // Calculate pagination options using the helper function
  const paginationOptions = paginationHelpers.calculatePagination({
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
    sortBy: sortBy ? (sortBy as string) : undefined,
    sortOrder: sortOrder ? (sortOrder as string) : undefined,
  });

  const users: IUser[] = await UserModel.find()
    .select('-password')
    .skip(paginationOptions.skip)
    .limit(paginationOptions.limit);

  const totalUsersCount = await UserModel.countDocuments({});

  if (users.length > 0) {
    // Cache the response for future use
    redisClient.set(
      cacheKey,
      JSON.stringify({
        statusCode: 200,
        success: true,
        message: 'Successfully retrieved users with pagination',
        meta: {
          page: paginationOptions.page,
          limit: paginationOptions.limit,
          total: totalUsersCount,
        },
        users,
      }),
      'EX',
      3600,
    );

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: 'Successfully retrieved users with pagination',
      meta: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
        total: totalUsersCount,
      },
      users,
    });
  } else {
    res.status(404).json({
      statusCode: 404,
      success: false,
      message: 'No user information found',
    });
  }
});
export const getUserById: RequestHandler = catchAsync(async (req, res) => {
  const userId = req.params.id;
  const user = await UserModel.findById(userId);

  if (user) {
    // Cache the user data
    const key = `user:${userId}`;

    redisClient.set(key, JSON.stringify(user), 'EX', 3600);
    // Send the user data as response
    res.status(200).json({
      statusCode: 200,
      success: true,
      message: 'Successfully retrieved user by ID',
      user,
    });
  } else {
    res.status(404).json({
      statusCode: 404,
      success: false,
      message: 'User not found',
    });
  }
});

export const deleteUserById: RequestHandler = catchAsync(async (req, res) => {
  const userId = req.params.id;
  const cacheKey = `deletedUser:${userId}`;

  // Check if the data exists in the cache
  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    // If cached data exists, send it as response
    const parsedData = JSON.parse(cachedData);
    return res.status(200).json(parsedData);
  }

  const deletedUser = await UserModel.findByIdAndUpdate(
    userId,
    { isDeleted: true },
    { new: true },
  );

  if (deletedUser) {
    redisClient.set(
      cacheKey,
      JSON.stringify({
        statusCode: 200,
        success: true,
        message: 'User marked as deleted successfully',
        deletedUser,
      }),
      'EX',
      3600,
    );

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: 'User marked as deleted successfully',
      deletedUser,
    });
  } else {
    res.status(404).json({
      statusCode: 404,
      success: false,
      message: 'User not found',
    });
  }
});

export const updateProfile: RequestHandler = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const { _id } = user;
  const updatedUserInfo = req.body;

  const updatedUser = await updateUserInDatabase(_id, updatedUserInfo);

  if (updatedUser) {
    // Cache the updated user data
    const cacheKey = `user:${_id}`;
    redisClient.set(cacheKey, JSON.stringify(updatedUser), 'EX', 3600);

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: 'User information updated successfully',
      updatedUser,
    });
  } else {
    res.status(404).json({
      statusCode: 404,
      success: false,
      message: 'User not found',
    });
  }
});

export const updateUserById: RequestHandler = catchAsync(async (req, res) => {
  const userId = req.params.id;
  const updatedUserInfo = req.body;

  const updatedUser = await updateUserInDatabase(userId, updatedUserInfo);

  if (updatedUser) {
    // Cache the updated user data
    const cacheKey = `user:${userId}`;
    redisClient.set(cacheKey, JSON.stringify(updatedUser), 'EX', 3600); // Cache for 1 hour

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: 'User information updated successfully',
      updatedUser,
    });
  } else {
    res.status(404).json({
      statusCode: 404,
      success: false,
      message: 'User not found',
    });
  }
});
export const promoteUser: RequestHandler = catchAsync(async (req, res) => {
  const userId = req.params.id;
  const targetRole = req.body.role;

  const user = await UserModel.findById(userId);

  if (user) {
    // Check if the user is a super admin before promoting
    if (req.body.user?.role === 'superAdmin') {
      user.role = targetRole;
      await user.save();

      // Cache the updated user data
      const cacheKey = `user:${userId}`;
      redisClient.set(cacheKey, JSON.stringify(user), 'EX', 3600);

      res.status(200).json({
        statusCode: 200,
        success: true,
        message: `User promoted to ${targetRole} successfully`,
        user,
      });
    } else {
      res.status(403).json({
        statusCode: 403,
        success: false,
        message: 'Unauthorized Access',
        error: 'Super admin rights required to promote users',
      });
    }
  } else {
    res.status(404).json({
      statusCode: 404,
      success: false,
      message: 'User not found',
    });
  }
});

async function updateUserInDatabase(
  userId: string,
  updatedUserInfo: any,
): Promise<IUser | null> {
  return UserModel.findByIdAndUpdate(userId, updatedUserInfo, { new: true });
}
