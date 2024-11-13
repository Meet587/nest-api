import {
  Inject,
  Injectable,
  NotFoundException,
  Scope,
  BadRequestException,
  InternalServerErrorException,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
import { UploadProfileResDto } from './dto/upload-profile-res.dto';
import { JwtPayloadType } from './dto/jwt-payload.type';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { ServiceConfig } from 'src/config/interface/service.congif';

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(
    @Inject(REQUEST) private request: Request,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(
        createUserDto.password,
        saltRounds,
      );

      const newUser = this.usersRepository.create({
        email: createUserDto.email,
        password: hashedPassword,
      });

      return await this.usersRepository.save(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      throw new BadRequestException('Failed to create user');
    }
  }

  async findOneByEmail(email: string): Promise<UserEntity> {
    try {
      const res = await this.usersRepository.findOne({ where: { email } });
      if (!res) {
        throw new NotFoundException('User not found');
      }
      return res;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        console.error('Error finding user by email:', error);
        throw new InternalServerErrorException('Failed to find user');
      }
    }
  }

  async getUserById(uId: number): Promise<UserEntity | undefined> {
    try {
      const user = await this.usersRepository.findOne({ where: { id: uId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        console.error('Error getting user by ID:', error);
        throw new InternalServerErrorException('Failed to get user');
      }
    }
  }

  async uploadProfilePicture(
    file: Express.Multer.File,
  ): Promise<UploadProfileResDto> {
    try {
      const payload = this.request.user as JwtPayloadType;
      const { uId } = payload;
      if (!uId) {
        throw new UnauthorizedException();
      }

      if (!file) {
        throw new BadRequestException('provide profile pic.');
      }
      const user = await this.getUserById(uId);

      if (!user) {
        throw new NotFoundException('user not found.');
      }
      if (user.profilePicture) {
        const oldFilePath = path.join(
          __dirname,
          '..',
          '..',
          'public',
          user.profilePicture,
        );
        if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
      }

      const filePath = `profile_pic/${file.filename}`;
      user.profilePicture = filePath;

      const updatedUser = await this.usersRepository.save(user);
      const { password, ...rest } = updatedUser;
      rest.profilePicture = path.join(
        this.configService.getOrThrow<ServiceConfig>(
          'environment.serviceConfig',
        ).webHostUrl,
        '/' + updatedUser.profilePicture,
      );
      return { ...rest };
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Failed to upload profile picture',
        );
      }
    }
  }

  async getProfilePicture(): Promise<string> {
    try {
      const payload = this.request.user as JwtPayloadType;
      const { uId } = payload;
      if (!uId) {
        throw new UnauthorizedException();
      }

      const user = await this.getUserById(uId);
      if (!user.profilePicture) {
        throw new NotFoundException('Profile picture not found');
      }
      const link = path.join(
        this.configService.getOrThrow<ServiceConfig>(
          'environment.serviceConfig',
        ).webHostUrl,
        '/' + user.profilePicture,
      );
      return link;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        console.error('Error getting profile picture:', error);
        throw new InternalServerErrorException('Failed to get profile picture');
      }
    }
  }
}
