import { USER_ROLE } from '../user/user.constant';
import auth from '../../middlewares/authMiddleware';
import validateRequest from '../../middlewares/validateRequest';
import { AuthValidation } from './auth.validation';
//import express, { NextFunction, Request, Response } from 'express';
import {
  changePassword,
  login,
  logout,
  refreshToken,
  register,
} from './authController';
import express from 'express';
//import { upload } from '../../../utils/sendImageToCloudinary';

const router = express.Router();

router.post(
  '/register',

  validateRequest(AuthValidation.RegisterZodSchema),
  register,
);
router.post('/login', validateRequest(AuthValidation.loginZodSchema), login);
router.post('/logout', logout);
router.post(
  '/refresh-token',
  validateRequest(AuthValidation.refreshTokenZodSchema),
  refreshToken,
);
router.post(
  '/change-password',
  auth(USER_ROLE.user, USER_ROLE.admin),
  validateRequest(AuthValidation.changePasswordZodSchema),
  changePassword,
);

export const AuthRoutes = router;
