import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import { REQUEST } from '@nestjs/core';
import path from 'path';

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(
    @Inject(REQUEST) private request: Request,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
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
  }

  async findOneByEmail(email: string): Promise<UserEntity | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async getUserById(uId: number): Promise<UserEntity | undefined> {
    return this.usersRepository.findOne({ where: { id: uId } });
  }

  async uploadProfilePicture(
    userId: number,
    file: Express.Multer.File,
  ): Promise<UserEntity> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    console.log(file);
    const filePath = `profile_pic/${file.filename}`;
    user.profilePicture = filePath;
    return this.usersRepository.save(user);
  }

  async getProfilePicture(userId: number): Promise<string> {
    const user = await this.getUserById(userId);
    if (!user || !user.profilePicture) {
      throw new NotFoundException('Profile picture not found');
    }
    return user.profilePicture;
  }

  async updateProfilePicture(
    userId: number,
    file: Express.Multer.File,
  ): Promise<UserEntity> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.profilePicture) {
      const oldFilePath = path.join(__dirname, '..', '..', user.profilePicture);
      fs.unlink(oldFilePath, (err) => {
        if (err) {
          console.error('Failed to delete old profile picture:', err);
        }
      });
    }
    const filePath = `profile_pic/${file.filename}`;
    user.profilePicture = filePath;
    return this.usersRepository.save(user);
  }
}
