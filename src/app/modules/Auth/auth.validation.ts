import { z } from 'zod';

const RegisterZodSchema = z.object({
  body: z.object({
    username: z.string({
      required_error: ' Username is required',
    }),

    password: z.string({
      required_error: 'Password is required',
    }),

    email: z.string({
      required_error: 'email is required',
    }),

    gender: z.string({
      required_error: 'gender is required',
    }),

    role: z.string({
      required_error: 'Role is required',
    }),
    phoneNumber: z.string({
      required_error: '  phoneNumber  is required',
    }),
  }),
});

const loginZodSchema = z.object({
  body: z.object({
    username: z.string({
      required_error: ' Username is required',
    }),

    password: z.string({
      required_error: 'Password is required',
    }),
  }),
});

const refreshTokenZodSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      required_error: 'Refresh Token is required',
    }),
  }),
});

const changePasswordZodSchema = z.object({
  body: z.object({
    currentPassword: z.string({
      required_error: 'Old password  is required',
    }),
    newPassword: z.string({
      required_error: 'New password  is required',
    }),
  }),
});

export const AuthValidation = {
  RegisterZodSchema,
  loginZodSchema,
  refreshTokenZodSchema,
  changePasswordZodSchema,
};
