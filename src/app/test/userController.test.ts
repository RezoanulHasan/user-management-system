/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import request from 'supertest';
import { redisClient } from '../../config/configureRedis';
import { UserModel } from '../modules/user/user.model';
import app from '../../app';
import {
  promoteUser,
  updateProfile,
  updateUserById,
} from '../modules/user/user.controller';

jest.mock('../../config/configureRedis', () => ({
  redisClient: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

jest.mock('../modules/user/user.model', () => ({
  UserModel: {
    findById: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

describe('GET /api/all-users', () => {
  it('should return users with pagination from cache if available', async () => {
    const cachedData = {
      statusCode: 200,
      success: true,
      message: 'Successfully retrieved users with pagination',
      meta: { page: 1, limit: 10, total: 20 },
      users: [
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' },
      ],
    };
    (redisClient.get as jest.Mock).mockResolvedValue(
      JSON.stringify(cachedData),
    );

    const response = await request(app)
      .get('/api/users')
      .query({ page: 1, limit: 10 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(cachedData);
  });

  it('should return users with pagination from database if not available in cache', async () => {
    const userData = [
      { id: 1, name: 'User 1' },
      { id: 2, name: 'User 2' },
    ];
    (UserModel.find as jest.Mock).mockResolvedValue(userData);
    (UserModel.countDocuments as jest.Mock).mockResolvedValue(20);

    const response = await request(app)
      .get('/api/users')
      .query({ page: 1, limit: 10 });

    expect(response.status).toBe(200);
    expect(response.body.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      'Successfully retrieved users with pagination',
    );
    expect(response.body.meta.page).toBe(1);
    expect(response.body.meta.limit).toBe(10);
    expect(response.body.meta.total).toBe(20);
    expect(response.body.users).toEqual(userData);
  });

  it('should return 404 if no user information found', async () => {
    (UserModel.find as jest.Mock).mockResolvedValue([]);
    (UserModel.countDocuments as jest.Mock).mockResolvedValue(0);

    const response = await request(app)
      .get('/api/all-users')
      .query({ page: 1, limit: 10 });
    expect(response.status).toBe(404);
    expect(response.body.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('No user information found');
  });
});

describe('GET /api/users/:id', () => {
  it('should return user if user exists', async () => {
    const userId = '123'; // Sample user ID
    const user = { _id: userId, name: 'Test User' }; // Sample user object

    // Mocking UserModel.findById to resolve with the user object
    (UserModel.findById as jest.Mock).mockResolvedValue(user);

    const response = await request(app).get(`/api/users/${userId}`);

    // Asserting the response
    expect(response.status).toBe(200);
    expect(response.body.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Successfully retrieved user by ID');
    expect(response.body.user).toEqual(user);

    // Asserting that redisClient.set is called with the correct arguments
    expect(redisClient.set).toHaveBeenCalledWith(
      `user:${userId}`,
      JSON.stringify(user),
      'EX',
      3600,
    );
  });

  it('should return 404 if user does not exist', async () => {
    const userId = '123'; // Sample user ID

    // Mocking UserModel.findById to resolve with null (user not found)
    (UserModel.findById as jest.Mock).mockResolvedValue(null);

    const response = await request(app).get(`/api/users/${userId}`);

    // Asserting the response
    expect(response.status).toBe(404);
    expect(response.body.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('User not found');

    // Asserting that redisClient.set is not called since user does not exist
    expect(redisClient.set).not.toHaveBeenCalled();
  });
});

describe('DELETE /api/users/:id', () => {
  it('should mark user as deleted if user exists', async () => {
    const userId = '123'; // Sample user ID
    const deletedUser = { _id: userId, name: 'Deleted User', isDeleted: true }; // Sample deleted user object

    // Mocking redisClient.get to resolve with null (cached data not found)
    (redisClient.get as jest.Mock).mockResolvedValue(null);

    // Mocking UserModel.findByIdAndUpdate to resolve with the deletedUser object
    (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(deletedUser);

    const response = await request(app).delete(`/api/users/${userId}`);

    // Asserting the response
    expect(response.status).toBe(200);
    expect(response.body.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('User marked as deleted successfully');
    expect(response.body.deletedUser).toEqual(deletedUser);

    // Asserting that redisClient.set is called with the correct arguments
    expect(redisClient.set).toHaveBeenCalledWith(
      `deletedUser:${userId}`,
      JSON.stringify({
        statusCode: 200,
        success: true,
        message: 'User marked as deleted successfully',
        deletedUser,
      }),
      'EX',
      3600,
    );
  });

  it('should return 404 if user does not exist', async () => {
    const userId = '123'; // Sample user ID

    // Mocking redisClient.get to resolve with null (cached data not found)
    (redisClient.get as jest.Mock).mockResolvedValue(null);

    // Mocking UserModel.findByIdAndUpdate to resolve with null (user not found)
    (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

    const response = await request(app).delete(`/api/users/${userId}`);

    // Asserting the response
    expect(response.status).toBe(404);
    expect(response.body.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('User not found');

    // Asserting that redisClient.set is not called since user does not exist
    expect(redisClient.set).not.toHaveBeenCalled();
  });

  it('should return cached data if available', async () => {
    const userId = '123'; // Sample user ID
    const cachedData = {
      statusCode: 200,
      success: true,
      message: 'User marked as deleted successfully',
      deletedUser: {
        _id: userId,
        name: 'Cached Deleted User',
        isDeleted: true,
      },
    }; // Sample cached data object

    // Mocking redisClient.get to resolve with cachedData
    (redisClient.get as jest.Mock).mockResolvedValue(
      JSON.stringify(cachedData),
    );

    const response = await request(app).delete(`/api/users/${userId}`);

    // Asserting the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual(cachedData);

    // Asserting that UserModel.findByIdAndUpdate and redisClient.set are not called since cached data is returned
    expect(UserModel.findByIdAndUpdate).not.toHaveBeenCalled();
    expect(redisClient.set).not.toHaveBeenCalled();
  });
});

describe('User Controller Functions', () => {
  describe('updateProfile', () => {
    it('should update user profile and cache the updated data', async () => {
      const userId = '123'; // Sample user ID
      const updatedUserInfo = { name: 'Updated User' }; // Sample updated user info
      const updatedUser = {
        _id: userId,
        name: 'Updated User',
        email: 'test@example.com',
      }; // Sample updated user object

      // Mocking updateUserInDatabase to resolve with the updatedUser
      (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedUser);

      const req = { user: { _id: userId }, body: updatedUserInfo };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn(); // Mocking the 'next' function

      await updateProfile(req as any, res as any, next);

      // Asserting the response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: 200,
        success: true,
        message: 'User information updated successfully',
        updatedUser,
      });

      // Asserting that redisClient.set is called with the correct arguments
      expect(redisClient.set).toHaveBeenCalledWith(
        `user:${userId}`,
        JSON.stringify(updatedUser),
        'EX',
        3600,
      );
    });
  });
});

describe('updateUserById', () => {
  it('should update user by ID and cache the updated data', async () => {
    const userId = '123'; // Sample user ID
    const updatedUserInfo = { name: 'Updated User' }; // Sample updated user info
    const updatedUser = {
      _id: userId,
      name: 'Updated User',
      email: 'test@example.com',
    }; // Sample updated user object

    // Mocking updateUserInDatabase to resolve with the updatedUser
    (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedUser);

    const req = { params: { id: userId }, body: updatedUserInfo };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn(); // Mocking the 'next' function

    await updateUserById(req as any, res as any, next);

    // Asserting the response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 200,
      success: true,
      message: 'User information updated successfully',
      updatedUser,
    });

    // Asserting that redisClient.set is called with the correct arguments
    expect(redisClient.set).toHaveBeenCalledWith(
      `user:${userId}`,
      JSON.stringify(updatedUser),
      'EX',
      3600,
    );
  });

  // Add more test cases for error scenarios if needed
});

describe('promoteUser', () => {
  // Write test cases for promoteUser
  it('should promote user if user exists and requester is super admin', async () => {
    const userId = '123'; // Sample user ID
    const targetRole = 'admin'; // Sample target role
    const user = { _id: userId, name: 'User', role: 'superAdmin' }; // Sample user object

    // Mocking UserModel.findById to resolve with the user object
    (UserModel.findById as jest.Mock).mockResolvedValue(user);

    // Mocking updateUserInDatabase to resolve with the updated user
    (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(user);

    const req = { params: { id: userId }, body: { role: targetRole, user } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn(); // Mocking the 'next' function

    await promoteUser(req as any, res as any, next);

    // Asserting the response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 200,
      success: true,
      message: `User promoted to ${targetRole} successfully`,
      user,
    });

    // Asserting that redisClient.set is called with the correct arguments
    expect(redisClient.set).toHaveBeenCalledWith(
      `user:${userId}`,
      JSON.stringify(user),
      'EX',
      3600,
    );
  });
});
