import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtPayloadType } from 'src/user/dto/jwt-payload.type';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserEntity } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.userService.findOneByEmail(email);

      if (user && (await bcrypt.compare(password, user.password))) {
        const { password, ...result } = user;
        return result;
      }
      throw new UnauthorizedException('Invalid credentials');
    } catch (error) {
      if (error instanceof HttpException) {
        console.log('dfsdfsfdsdfsfsfsf', error);
        throw error;
      } else {
        console.error('Error validating user:', error);
        throw new InternalServerErrorException(
          'An error occurred during user validation',
        );
      }
    }
  }

  async register(createUserDto: CreateUserDto): Promise<any> {
    try {
      const existingUser = await this.usersRepository.findOne({
        where: { email: createUserDto.email },
      });
      if (existingUser) {
        throw new BadRequestException('user already exists');
      }
      const user = await this.userService.create(createUserDto);
      const { password, ...rest } = user;
      return { ...rest };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        console.error('Error during login:', error);
        throw new InternalServerErrorException(
          'An error occurred during login',
        );
      }
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.validateUser(loginDto.email, loginDto.password);
      const payload: JwtPayloadType = { uId: user.id, email: user.email };
      const { password, ...rest } = user;
      return {
        user: {
          ...rest,
          access_token: await this.jwtService.signAsync(payload, {
            expiresIn: process.env.JWT_ACCESS_TOKEN_EXP,
            secret: process.env.JWL_SECRET,
          }),
          refresh_token: await this.jwtService.signAsync(payload, {
            expiresIn: process.env.JWT_REFRESH_TOKEN_EXP,
            secret: process.env.JWL_SECRET,
          }),
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        console.error('Error during login:', error);
        throw new InternalServerErrorException(
          'An error occurred during login',
        );
      }
    }
  }

  async refreshToken(token: string) {
    try {
      const decoded = (await this.jwtService.verifyAsync(token, {
        secret: process.env.JWL_SECRET,
      })) as JwtPayloadType;

      const payload = { email: decoded.email, id: decoded.uId };

      return {
        access_token: await this.jwtService.signAsync(payload, {
          expiresIn: '15m',
          secret: process.env.JWL_SECRET,
        }),
        refresh_token: await this.jwtService.signAsync(payload, {
          expiresIn: '7d',
          secret: process.env.JWL_SECRET,
        }),
      };
    } catch (error) {
      console.error('Error refreshing token:', error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Invalid refresh token');
      }
    }
  }
}
