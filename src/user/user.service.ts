import {
  Inject,
  Injectable,
  NotFoundException,
  Scope,
  BadRequestException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import { REQUEST } from '@nestjs/core';
import path from 'path';
import { UploadProfileResDto } from './dto/upload-profile-res.dto';

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(
    @Inject(REQUEST) private request: Request,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
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
    userId: number,
    file: Express.Multer.File,
  ): Promise<UploadProfileResDto> {
    try {
      const user = await this.getUserById(userId);
      console.log(file);
      const filePath = `profile_pic/${file.filename}`;
      user.profilePicture = filePath;

      const updatedUser = await this.usersRepository.save(user);
      const { password, ...rest } = updatedUser;
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

  async getProfilePicture(userId: number): Promise<string> {
    try {
      const user = await this.getUserById(userId);
      if (!user.profilePicture) {
        throw new NotFoundException('Profile picture not found');
      }
      return user.profilePicture;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        console.error('Error getting profile picture:', error);
        throw new InternalServerErrorException('Failed to get profile picture');
      }
    }
  }

  async updateProfilePicture(
    userId: number,
    file: Express.Multer.File,
  ): Promise<UserEntity> {
    try {
      const user = await this.getUserById(userId);
      if (user.profilePicture) {
        const oldFilePath = path.join(
          __dirname,
          '..',
          '..',
          user.profilePicture,
        );
        await fs.promises.unlink(oldFilePath);
      }
      const filePath = `profile_pic/${file.filename}`;
      user.profilePicture = filePath;
      return await this.usersRepository.save(user);
    } catch (error) {
      console.error('Error updating profile picture:', error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Failed to update profile picture',
        );
      }
    }
  }
}
