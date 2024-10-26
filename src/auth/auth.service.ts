import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtPayloadType } from 'src/user/dto/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    const payload: JwtPayloadType = { uId: user.id, email: user.email };
    const { password, ...rest } = user;
    return {
      user: {
        ...rest,
        access_token: this.jwtService.sign(payload, {
          expiresIn: '15m',
          secret: process.env.JWL_SECRET,
        }),
        refresh_token: this.jwtService.sign(payload, {
          expiresIn: '7d',
          secret: process.env.JWL_SECRET,
        }),
      },
    };
  }

  async refreshToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token) as JwtPayloadType;
      const payload = { email: decoded.email, id: decoded.uId };
      return this.jwtService.sign(payload, { expiresIn: '15m' });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
