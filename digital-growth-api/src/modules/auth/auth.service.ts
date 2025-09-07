import bcrypt from 'bcryptjs';
import { User, IUser } from '../users/user.model';
import { ApiError } from '../../common/errors';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  sanitizeUser
} from '../../common/utils';
import { ROLES, MAX_REFRESH_TOKENS } from '../../common/constants';
import { hashPassword } from '../../common/utils';

export class AuthService {
  static async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }): Promise<{ user: any; accessToken: string; refreshToken: string }> {
    try {
      // Default role for public registration
      const role = userData.role || ROLES.PROJECT_MEMBER;

      const user = new User({
        ...userData,
        role,
      });

      await user.save();

      const tokens = await this.generateTokens(user, {});

      return {
        user: sanitizeUser(user),
        ...tokens,
      };
    } catch (error: any) {
      if (error.code === 11000) {
        throw ApiError.conflict('Email already registered', [
          { field: 'email', issue: 'Already exists' }
        ]);
      }
      throw error;
    }
  }

  static async login(
    email: string,
    password: string,
    metadata: { ip?: string; ua?: string } = {}
  ): Promise<{ user: any; accessToken: string; refreshToken: string }> {
    const user = await User.findOne({ email, isActive: true }).select('+password');

    if (user?.defaultPassword) {
      if (password === user.defaultPassword) {
        return {
          user: {
            _id: user._id,
            isFirstLogin: true
          },
          accessToken: '',
          refreshToken: ''
        };
      } else {
        throw ApiError.unauthorized('Invalid email or default password');
      }
    }

    console.log('User found for login:', user);
    if (!user || !(await user.comparePassword(password))) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const tokens = await this.generateTokens(user, metadata);

    return {
      user: sanitizeUser(user),
      ...tokens,
    };
  }

  static async refreshToken(
    refreshToken: string,
    metadata: { ip?: string; ua?: string } = {}
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.sub).select('+refreshTokens');

      if (!user || !user.isActive) {
        throw ApiError.unauthorized('Invalid refresh token');
      }

      // Hash the provided token to compare with stored hashes
      const tokenHash = await bcrypt.hash(refreshToken, 1);
      const tokenIndex = user.refreshTokens.findIndex(
        rt => bcrypt.compareSync(refreshToken, rt.tokenHash)
      );

      if (tokenIndex === -1) {
        // Possible reuse attack - invalidate all refresh tokens
        user.refreshTokens = [];
        await user.save();
        throw ApiError.unauthorized('Invalid refresh token - all sessions revoked');
      }

      // Remove the used refresh token
      user.refreshTokens.splice(tokenIndex, 1);

      // Generate new tokens
      const tokens = await this.generateTokens(user, metadata);

      return tokens;
    } catch (error: any) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Invalid refresh token');
      }
      throw error;
    }
  }

  static async logout(refreshToken: string): Promise<void> {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.sub).select('+refreshTokens');

      if (user) {
        // Remove the specific refresh token
        user.refreshTokens = user.refreshTokens.filter(
          rt => !bcrypt.compareSync(refreshToken, rt.tokenHash)
        );
        await user.save();
      }
    } catch (error) {
      // Silent fail for logout
    }
  }

  static async getCurrentUser(userId: string): Promise<any> {
    const user = await User.findById(userId).select('-password -refreshTokens');

    if (!user || !user.isActive) {
      throw ApiError.unauthorized('User not found or inactive');
    }

    return sanitizeUser(user);
  }

  private static async generateTokens(
    user: IUser,
    metadata: { ip?: string; ua?: string } = {}
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = generateAccessToken({
      sub: user._id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      sub: user._id,
      type: 'refresh',
    });

    // Hash and store refresh token
    const tokenHash = await bcrypt.hash(refreshToken, 12);

    // Clean old tokens if at limit
    if (user.refreshTokens.length >= MAX_REFRESH_TOKENS) {
      user.refreshTokens = user.refreshTokens
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, MAX_REFRESH_TOKENS - 1);
    }

    user.refreshTokens.push({
      tokenHash,
      createdAt: new Date(),
      ip: metadata.ip,
      ua: metadata.ua,
    });

    await user.save();

    return { accessToken, refreshToken };
  }
  static async resetPassword(userId: string, newPassword: string): Promise<void> {
    if (!userId || !newPassword) {
      throw ApiError.badRequest('User ID and new password are required');
    }

    try {
      const user = await User.findById(userId).select('+password +isActive');
      if (!user) throw ApiError.notFound('User not found');
      if (!user.isActive) throw ApiError.forbidden('User account is inactive');

      //user.password = await hashPassword(newPassword);
      user.password = newPassword;
      user.refreshTokens = [];
      user.set('defaultPassword', undefined);

      await user.save();
    } catch (error: any) {
      if (['JsonWebTokenError', 'TokenExpiredError'].includes(error.name)) {
        throw ApiError.unauthorized('Invalid or expired reset token');
      }

      console.error('Error resetting password:', error);
      throw ApiError.internal('An unexpected error occurred while resetting the password');
    }
  }
}