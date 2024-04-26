import express from 'express';

import {
  deleteUserById,
  getAllUsers,
  getUserById,
  promoteUser,
  updateProfile,
  updateUserById,
} from './user.controller';
import { USER_ROLE } from './user.constant';
import { cacheMiddleware } from '../../middlewares/cacheMiddleware';
import auth from '../../middlewares/authMiddleware';

const router = express.Router();
//get all user
router.get(
  '/all-users',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  cacheMiddleware,
  getAllUsers,
);
//get user by id
router.get(
  '/users/:id',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  cacheMiddleware,
  getUserById,
);
//delete user by id
router.delete(
  '/users/:id',
  auth(USER_ROLE.superAdmin),
  cacheMiddleware,
  deleteUserById,
);
// Update own profile
router.put(
  '/profile',
  auth(USER_ROLE.admin, USER_ROLE.user),
  cacheMiddleware,
  updateProfile,
);
// Update user by id
router.put('/user/:id', auth(USER_ROLE.admin), cacheMiddleware, updateUserById);

//get user id promote
router.post(
  '/promote/:id',
  auth(USER_ROLE.superAdmin),
  cacheMiddleware,
  promoteUser,
);

export const UserRoutes = router;
