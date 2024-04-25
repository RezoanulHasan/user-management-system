/* eslint-disable @typescript-eslint/no-explicit-any */
import { TErrorSources, TGenericErrorResponse } from '../../interface/error';

const handleDuplicateError = (err: any): TGenericErrorResponse => {
  // Extract value within double quotes using regex
  const match = err.message.match(/"([^"]*)"/);

  // The extracted value will be in the first capturing group
  const extractedMessage = match && match[1];

  const errorSources: TErrorSources = [
    {
      // eslint-disable-next-line no-undef
      path: '',
      message: `${extractedMessage} is already exists`,
    },
  ];

  const statusCode = 400;

  // Constructing the generic error response
  const errorResponse: TGenericErrorResponse = {
    success: false,
    statusCode,
    message: 'Duplicate Entry',

    errorSources,

    errorDetails: {
      name: 'DuplicateError',
      message: `${extractedMessage} is already exists`,
    },
    //stack: null,
  };

  return errorResponse;
};

export default handleDuplicateError;
