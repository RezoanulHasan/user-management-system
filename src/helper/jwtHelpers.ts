import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../config';

const createToken = (
  payload: Record<string, unknown>,
  secret: Secret,
  expireTime: string,
): string => {
  const payloadWithIat = {
    ...payload,
  };

  return jwt.sign(payloadWithIat, secret, {
    algorithm: 'HS256',
    expiresIn: expireTime,
  });
};

const verifyToken = (token: string, secret: Secret): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};

const createPasswordResetToken = (payload: object) => {
  return jwt.sign(payload, config.jwt.secret as Secret, {
    algorithm: 'HS256',
  });
};

export const jwtHelpers = {
  createToken,
  verifyToken,
  createPasswordResetToken,
};
