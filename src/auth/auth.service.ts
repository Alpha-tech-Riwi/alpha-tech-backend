import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);
    const { password, ...result } = savedUser;
    
    return {
      user: result,
      token: this.jwtService.sign({ sub: savedUser.id, email: savedUser.email }),
    };
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { password: _, ...result } = user;
    
    return {
      user: result,
      token: this.jwtService.sign({ sub: user.id, email: user.email }),
    };
  }

  async validateUser(userId: string) {
    return this.userRepository.findOne({ 
      where: { id: userId },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'isVerified']
    });
  }
}