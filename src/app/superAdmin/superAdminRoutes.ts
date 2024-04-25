import {
  deleteUserById,
  getAllUsers,
  getUserById,
  promoteUser,
  updateProfile,
  updateUserById,
} from './superAdminController';
import express from 'express';
import { USER_ROLE } from '../modules/user/user.constant';
import auth from '../middlewares/authMiddleware';

const router = express.Router();
//get all user
router.get(
  '/all-users',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  getAllUsers,
);
//get user by id
router.get(
  '/user/:id',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  getUserById,
);
//delete user by id
router.delete('/user/:id', auth(USER_ROLE.superAdmin), deleteUserById);
// Update own profile
router.put('/profile', auth(USER_ROLE.admin, USER_ROLE.user), updateProfile);
// Update user by id
router.put('/user/:id', auth(USER_ROLE.admin), updateUserById);

//get user id promote
router.post('/promote/:id', auth(USER_ROLE.superAdmin), promoteUser);

export const AdminRoutes = router;
