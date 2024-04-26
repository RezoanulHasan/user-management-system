import express from 'express';
import { AuthRoutes } from '../modules/Auth/authRoutes';

import { UserRoutes } from '../modules/user/userRoutes';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/',
    route: UserRoutes,
  },

  {
    path: '/auth',
    route: AuthRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
