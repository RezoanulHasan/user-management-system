/* eslint-disable no-undef */
import mongoose from 'mongoose';
import { TErrorSources, TGenericErrorResponse } from '../../interface/error';

const handleCastError = (
  err: mongoose.Error.CastError,
): TGenericErrorResponse => {
  const errorSources: TErrorSources = [
    {
      path: err.path,
      message: `Invalid value for ${err.path}`,
    },
  ];

  const statusCode = 400;

  // Constructing the generic error response
  const errorResponse: TGenericErrorResponse = {
    success: false,
    statusCode,

    message: 'Invalid ID',

    errorSources,
    errorDetails: {
      name: 'CastError',
      message: `Invalid value for ${err.path}`,
    },
    //stack: null, // Stack is not available for this error
  };

  return errorResponse;
};

export default handleCastError;
