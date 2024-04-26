# Project-name: User-Management-System

## Project-type: Back-End

## API-documentation-link: 

## Technology use

- Node js
- Express js
- Mongoose
- typescript
- Redis,Redis Pub/Sub
- Winston
- Jest
- JWT(validation)
- bcrypt (validation)
- Zod (validation)
- eslint ( code formatting and quality checking )
- prettier (maintain code structure)

## Proper Error handling

- Jwt Error
- Validation Error
- Cast Error
- Duplicate Entry
- Internal Server Error

- 

# API  Documentation

## Table of Contents for users

- **Endpoint:** `/api/auth/register`
- **Method:** `POST`
- **Request Body:** data formate like this \*

```json

{
  "username": "your_username",
  "password": "your_password",
  "email": "your_email@example.com",
  "gender"":"your-gender",
" phone":"your_number"
  "role": "user"/"admin"
}

```

- **Endpoint:** `/api/auth/login`
- **Method:** `POST`
- **Request Body:** data formate like this \*

```json
{
  "username": "your_username",
  "password": "your_password"
}
```

- **Endpoint:** `/api/auth/change-Password`
- **Method:** `POST`
- **Access:** `Authenticated User  `
- **Request Body:** data formate like this \*

```json
{
  "currentPassword": "your_current_password",
  "newPassword": "set_new_password"
}
```



## For  update userinfo

- **Endpoint**: `PUT /api/users/:id`
- **Request Headers**:
  - Authorization: `<JWT_TOKEN>`  
- **Access:** `admin`
- **Request Body:** data formate like this \*
- Admins can update their information or any user information.
  
```json

{
  "username": "your_username",
  "password": "your_password",
  "email": "your_email@example.com",
  "gender"":"your-gender",
" phone":"your_number"

}

```
  

### 9. Update My Profile
- Users can  update their information such as name, image, email, address, and
phone number, but cannot perform any update operation on other users.

- **Endpoint**: `PUT /api/my-profile`
- **Request Headers**:
  - Authorization: `<JWT_TOKEN>`
 - **Access:** `admin` and  `user`
 - 
```json

{
  "username": "your_username",
  "password": "your_password",
  "email": "your_email@example.com",
  "gender"":"your-gender",
" phone":"your_number"

}

```

## For ADMIN 

### Get all users with pagination

- **Endpoint:** `/api/users`
- **Method:** `GET`
- **Access:** `admin`

### Get single user by ID

- **Endpoint:** `/api/users/:id`
- **Method:** `GET`
- **Access:** `admin`

### Delete a user
-  Delete form  user model and   user profile
- **Endpoint:** `/api/users/:id`
- **Method:** `Delete`
- **Access:** `admin`


## Getting Started

to set up and run projects locally

- download this repository
- npm install
- npm run build
- npm run start: dev
