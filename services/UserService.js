import { User } from '../models/User.js';
import { hashPassword } from '../utils/helpers.js';
import { query } from '../config/database.js';
import logger from '../utils/logger.js';

export class UserService {
  static async createUser(userData) {
    try {
      const { name, email, phone, password, status, user_type, address, dob, gender } = userData;

      // Check if email already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        throw new Error('Email already exists');
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = await User.create({
        name,
        email,
        phone,
        password: hashedPassword,
        status,
        user_type,
        address,
        dob,
        gender
      });

      logger.info(`User created successfully: ${email}`);
      return { userId: user.id };
    } catch (error) {
      logger.error('UserService createUser error:', error);
      throw error;
    }
  }

  static async getAllUsers(filters = {}) {
    try {
      const { page = 1, limit = 10, search = '', status, user_type, is_blocked } = filters;
      const offset = (page - 1) * limit;

      const filterOptions = {
        search,
        status,
        user_type,
        is_blocked: is_blocked === 'true' ? true : is_blocked === 'false' ? false : undefined,
        limit,
        offset
      };

      const result = await User.getAll(filterOptions);

      return {
        data: result.users,
        pagination: {
          page,
          limit,
          total: result.total,
          pages: Math.ceil(result.total / limit)
        }
      };
    } catch (error) {
      logger.error('UserService getAllUsers error:', error);
      throw error;
    }
  }

  static async getUserById(id) {
    try {
      const user = await User.findById(id);
      if (!user) {
        throw new Error('User not found');
      }

      // Remove password from response
      delete user.password;
      return user;
    } catch (error) {
      logger.error('UserService getUserById error:', error);
      throw error;
    }
  }

  static async updateUser(id, userData) {
    try {
      const existingUser = await User.findById(id);
      if (!existingUser) {
        throw new Error('User not found');
      }

      const success = await User.update(id, userData);
      if (!success) {
        throw new Error('No fields to update');
      }

      logger.info(`User updated successfully: ${id}`);
      return { success: true };
    } catch (error) {
      logger.error('UserService updateUser error:', error);
      throw error;
    }
  }

  static async updateUserStatus(id, status) {
    try {
      const existingUser = await User.findById(id);
      if (!existingUser) {
        throw new Error('User not found');
      }

      await User.update(id, { status });
      logger.info(`User status updated to ${status}: ${id}`);
      return { success: true };
    } catch (error) {
      logger.error('UserService updateUserStatus error:', error);
      throw error;
    }
  }

  static async updateUserBlockStatus(id, is_blocked) {
    try {
      const existingUser = await User.findById(id);
      if (!existingUser) {
        throw new Error('User not found');
      }

      await User.update(id, { is_blocked });
      const message = is_blocked ? 'User blocked successfully' : 'User unblocked successfully';
      logger.info(`${message}: ${id}`);
      return { success: true, message };
    } catch (error) {
      logger.error('UserService updateUserBlockStatus error:', error);
      throw error;
    }
  }

  static async deleteUser(id) {
    try {
      const existingUser = await User.findById(id);
      if (!existingUser) {
        throw new Error('User not found');
      }

      await User.softDelete(id);
      logger.info(`User deleted successfully: ${id}`);
      return { success: true };
    } catch (error) {
      logger.error('UserService deleteUser error:', error);
      throw error;
    }
  }

  static async getUserLoginHistory(id, filters = {}) {
    try {
      const { page = 1, limit = 10 } = filters;
      const offset = (page - 1) * limit;

      // Check if user exists
      const existingUser = await User.findById(id);
      if (!existingUser) {
        throw new Error('User not found');
      }

      // Get total count
      const countResult = await query(
        'SELECT COUNT(*) FROM user_logins WHERE user_id = $1',
        [id]
      );
      const total = parseInt(countResult.rows[0].count);

      // Get login history
      const loginsResult = await query(
        `SELECT id, login_at, ip_address, user_agent, platform, location, status
         FROM user_logins 
         WHERE user_id = $1
         ORDER BY login_at DESC
         LIMIT $2 OFFSET $3`,
        [id, limit, offset]
      );

      return {
        data: loginsResult.rows,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('UserService getUserLoginHistory error:', error);
      throw error;
    }
  }
}