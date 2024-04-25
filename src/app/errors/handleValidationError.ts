import mongoose from 'mongoose';
import { TErrorSources, TGenericErrorResponse } from '../../interface/error';

const handleValidationError = (
  err: mongoose.Error.ValidationError,
): TGenericErrorResponse => {
  const errorSources: TErrorSources = Object.values(err.errors).map(
    (val: mongoose.Error.ValidatorError | mongoose.Error.CastError) => {
      return {
        path: val?.path,
        message: val?.message,
      };
    },
  );

  const statusCode = 400;

  // Constructing the generic error response
  const errorResponse: TGenericErrorResponse = {
    success: false,
    statusCode,
    message: 'Validation Error',
    errorSources,

    errorDetails: {
      name: 'ValidationError',
      message: 'Validation failed',
    },
    // stack: null, // Stack is not available for this error
  };

  return errorResponse;
};

export default handleValidationError;
