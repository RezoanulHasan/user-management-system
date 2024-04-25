import { ZodError, ZodIssue } from 'zod';
import { TErrorSources, TGenericErrorResponse } from '../../interface/error';

const handleZodError = (err: ZodError): TGenericErrorResponse => {
  const errorSources: TErrorSources = err.issues.map((issue: ZodIssue) => {
    return {
      path: issue?.path[issue.path.length - 1],
      message: issue.message,
    };
  });

  const statusCode = 400;

  // Constructing the generic error response
  const errorResponse: TGenericErrorResponse = {
    success: false,
    statusCode,
    message: 'Validation Error',
    errorSources,

    errorDetails: {
      name: 'ZodError',
      message: 'Validation failed',
    },
    //stack: null, // Stack is not available for ZodError
  };

  return errorResponse;
};

export default handleZodError;
