import express, { NextFunction, Request, Response } from 'express';

import {
  deleteUserById,
  getAllUsers,
  getUserById,
  promoteUser,
  softDeleteUserById,
  updateProfile,
  updateUserById,
} from './user.controller';
import { USER_ROLE } from './user.constant';
import { cacheMiddleware } from '../../middlewares/cacheMiddleware';
import auth from '../../middlewares/authMiddleware';
import { upload } from '../../../utils/sendImageToCloudinary';

const router = express.Router();
//get all user
router.get(
  '/users',
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
//delete user by id  hard deleted remove from DB
router.delete(
  '/users/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  cacheMiddleware,
  deleteUserById,
);
//delete user by id  soft deleted not remove from DB just update status
router.delete(
  '/userSoftDelete/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  cacheMiddleware,
  softDeleteUserById,
);
// user and admin Update own profile
router.put(
  '/profile',
  auth(USER_ROLE.admin, USER_ROLE.user),

  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  cacheMiddleware,
  updateProfile,
);
// Update user by id   only admin
router.put(
  '/users/:id',
  auth(USER_ROLE.admin),

  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  cacheMiddleware,
  updateUserById,
);

//get user id promote
router.post(
  '/promote/:id',
  auth(USER_ROLE.superAdmin),
  cacheMiddleware,
  promoteUser,
);

export const UserRoutes = router;
