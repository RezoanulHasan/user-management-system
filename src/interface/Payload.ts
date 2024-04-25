/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line no-unused-vars
import { Response } from 'express';
//for auth controller
export interface TokenPayload {
  _id: string;
  username: string;
  email: string;
  role: string;
}

export interface ApiResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: any;
}
export const sendResponse = (
  res: Response,
  { statusCode, success, message, data }: ApiResponse,
) => {
  res.status(statusCode).json({
    success,
    statusCode,
    message,
    data,
  });
};
