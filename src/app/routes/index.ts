import express from 'express';
import { AuthRoutes } from '../modules/Auth/authRoutes';
import { AdminRoutes } from '../superAdmin/superAdminRoutes';
import { UserRoutes } from '../modules/user/userRoutes';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/users',
    route: UserRoutes,
  },

  {
    path: '/auth',
    route: AuthRoutes,
  },

  {
    path: '/',
    route: AdminRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
