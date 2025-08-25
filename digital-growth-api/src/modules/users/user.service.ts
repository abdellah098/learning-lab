import { User, IUser } from './user.model';
import { ApiError } from '../../common/errors';
import { buildSortQuery, buildFilterQuery, sanitizeUser } from '../../common/utils';
import { DEFAULT_PAGINATION, ROLES } from '../../common/constants';
import { AuthUser } from '../../types';

export class UserService {
  static async createUser(userData: Partial<IUser>): Promise<any> {
    try {
      const user = new User(userData);
      await user.save();
      return sanitizeUser(user);
    } catch (error: any) {
      if (error.code === 11000) {
        throw ApiError.conflict('Email already exists', [
          { field: 'email', issue: 'Already registered' }
        ]);
      }
      throw error;
    }
  }

  static async getUserById(id: string, requestingUser: AuthUser): Promise<any> {
    const user = await User.findById(id).select('-password -refreshTokens');
    
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Allow users to view their own profile or admins to view any profile
    if (user._id.toString() !== requestingUser._id && requestingUser.role !== ROLES.ADMIN) {
      // Project managers can view users in their projects (implement project membership check)
      if (requestingUser.role !== ROLES.PROJECT_MANAGER) {
        throw ApiError.forbidden('Cannot access other user profiles');
      }
    }

    return sanitizeUser(user);
  }

  static async updateUser(
    id: string, 
    updateData: Partial<IUser>, 
    requestingUser: AuthUser
  ): Promise<any> {
    const user = await User.findById(id).select('-password -refreshTokens');
    
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Permission checks
    const isSelfUpdate = user._id.toString() === requestingUser._id;
    const isAdmin = requestingUser.role === ROLES.ADMIN;

    if (!isSelfUpdate && !isAdmin) {
      throw ApiError.forbidden('Cannot update other users');
    }

    // Restrict fields for self-update
    if (isSelfUpdate && !isAdmin) {
      const allowedFields = ['firstName', 'lastName'];
      const restrictedFields = Object.keys(updateData).filter(
        field => !allowedFields.includes(field)
      );
      
      if (restrictedFields.length > 0) {
        throw ApiError.forbidden('Cannot update restricted fields');
      }
    }

    Object.assign(user, updateData);
    await user.save();
    
    return sanitizeUser(user);
  }

  static async deleteUser(id: string): Promise<void> {
    const user = await User.findById(id);
    
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Soft delete
    user.isActive = false;
    await user.save();
  }

  static async listUsers(filters: any = {}, pagination: any = {}): Promise<{
    users: any[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const page = Math.max(1, pagination.page || DEFAULT_PAGINATION.PAGE);
    const limit = Math.min(
      pagination.limit || DEFAULT_PAGINATION.LIMIT,
      DEFAULT_PAGINATION.MAX_LIMIT
    );
    const skip = (page - 1) * limit;

    const query = buildFilterQuery(filters);
    const sort = buildSortQuery(pagination.sort);

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -refreshTokens')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    return {
      users: users.map(sanitizeUser),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}