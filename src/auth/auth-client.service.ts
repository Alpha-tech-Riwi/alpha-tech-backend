import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
}

@Injectable()
export class AuthClientService {
  private readonly authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3005';

  async validateToken(token: string): Promise<AuthUser> {
    try {
      const response = await axios.get(`${this.authServiceUrl}/api/v1/auth/validate`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data.data.user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async getUserById(userId: string, token: string): Promise<AuthUser> {
    try {
      const response = await axios.get(`${this.authServiceUrl}/api/v1/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data.data.user;
    } catch (error) {
      throw new UnauthorizedException('User not found');
    }
  }
}