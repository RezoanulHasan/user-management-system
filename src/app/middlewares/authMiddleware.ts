/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { Secret, JwtPayload } from 'jsonwebtoken';
import httpStatus from 'http-status';
import { jwtHelpers } from '../../helper/jwtHelpers';

import config from '../../config';
import AppError from '../errors/AppError';

const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: JwtPayload | any },
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
      }

      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt.secret as Secret,
      );

      req.user = verifiedUser;

      const user = verifiedUser as JwtPayload;
      req.body.userId = user.id;

      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          'you are not permeated to access ',
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth;
