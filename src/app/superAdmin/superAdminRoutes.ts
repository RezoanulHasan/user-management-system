import {
  deleteUserById,
  getAllUsers,
  getUserById,
  promoteUser,
  updateUserById,
} from './superAdminController';
import express from 'express';
import { USER_ROLE } from '../modules/user/user.constant';
import auth from '../middlewares/authMiddleware';

const router = express.Router();
//get all user
router.get('/all-users', getAllUsers);
//get user id
router.get('/user/:id', getUserById);
//delete user id
router.delete('/user/:id', auth(USER_ROLE.superAdmin), deleteUserById);
// Update user by ID
router.put(
  '/user/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  updateUserById,
);
//get user id promote
router.post('/promote/:id', auth(USER_ROLE.superAdmin), promoteUser);

export const AdminRoutes = router;
