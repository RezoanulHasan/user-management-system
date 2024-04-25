/* eslint-disable prefer-const */
import config from '../../config';
import { hashedPassword } from '../../helper/PasswordHelpers';
import { UserModel as IUserModel } from '../modules/user/user.model';

const superUser = {
  username: config.super_admin_username,
  email: config.super_admin_email,
  password: config.super_admin_password,
  passwordChangeHistory: [], // Changed to an empty array for consistency
  role: 'superAdmin',
  phoneNumber: '01734639066',
  userImage: 'https://i.ibb.co/MDL2Nx5/Admin-n.jpg',
  isDeleted: false,
};

const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExists = await IUserModel.findOne({ role: 'superAdmin' });

    if (!isSuperAdminExists) {
      let { password, ...restSuperUser } = superUser;

      if (!password) {
        // Provide a default password if it's not defined
        password = 'defaultPassword';
      }
      const hashedPasswordValue = await hashedPassword(password);

      const superAdminWithHashedPassword = {
        ...restSuperUser,
        password: hashedPasswordValue,
      };

      await IUserModel.create(superAdminWithHashedPassword);
    }
  } catch (error) {
    console.error('Error seeding super admin:', error);
  }
};

export default seedSuperAdmin;
