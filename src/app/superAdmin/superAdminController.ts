/* eslint-disable no-undef */
import { RequestHandler } from 'express';
import { IUser, UserModel } from '../modules/user/user.model';
import catchAsync from '../../utils/catchAsync';
import { paginationHelpers } from '../../helper/paginationHelpers';

export const getAllUsers: RequestHandler = catchAsync(
  async (req, res): Promise<void> => {
    const { page, limit, sortBy, sortOrder } = req.query;

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
      // If no users are found, respond with a not found status and an error message
      res.status(404).json({
        statusCode: 404,
        success: false,
        message: 'No user information found',
      });
    }
  },
);

export const getUserById: RequestHandler = catchAsync(
  async (req, res): Promise<void> => {
    const userId = req.params.id;
    const user: IUser | null = await UserModel.findById(userId);

    if (user) {
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
  },
);

export const deleteUserById: RequestHandler = catchAsync(
  async (req, res): Promise<void> => {
    const userId = req.params.id;

    // Find the user by ID and update the isDeleted field
    const deletedUser: IUser | null = await UserModel.findByIdAndUpdate(
      userId,
      { isDeleted: true }, // Setting isDeleted to true
      { new: true },
    );

    if (deletedUser) {
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
  },
);

export const updateUserById: RequestHandler = catchAsync(
  async (req, res): Promise<void> => {
    const userId = req.params.id;
    const updatedUserInfo = req.body; // Assuming the request body contains updated user information

    // Find the user by ID and update the user information
    const updatedUser: IUser | null = await UserModel.findByIdAndUpdate(
      userId,
      updatedUserInfo,
      { new: true },
    );

    if (updatedUser) {
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
  },
);
export const promoteUser: RequestHandler = catchAsync(
  async (req, res): Promise<void> => {
    const userId = req.params.id;
    const targetRole = req.body.role; // Role to promote to (any thing)

    const user: IUser | null = await UserModel.findById(userId);

    if (user) {
      // Check if the user is a super admin before promoting
      if (req.body.user?.role === 'superAdmin') {
        // Update the user role based on the targetRole parameter
        user.role = targetRole;
        await user.save();

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
  },
);
