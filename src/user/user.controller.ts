import {
  Controller,
  Get,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Param,
  Put,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { UserEntity } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_FILE_TYPES = ['.jpg', '.jpeg', '.png'];

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Find a user by email' })
  @ApiResponse({ status: 200, description: 'Return the found user.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findOne(@Body() email: string) {
    return this.userService.findOneByEmail(email);
  }

  @Post(':userId/upload-profile-picture')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Upload a profile picture' })
  @ApiParam({ name: 'userId', type: 'number' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The profile picture has been successfully uploaded.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/profile_pic',
        filename: (req, file, callback) => {
          const uniqueSuffix = uuidv4() + extname(file.originalname);
          callback(null, uniqueSuffix);
        },
      }),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (req, file, callback) => {
        const fileExt = extname(file.originalname).toLowerCase();
        if (!ALLOWED_FILE_TYPES.includes(fileExt)) {
          return callback(
            new BadRequestException(
              'Only .jpg, .jpeg, and .png files are allowed',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadProfilePicture(
    @Param('userId') userId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log(process.env.JWL_SECRET);
    return this.userService.uploadProfilePicture(userId, file);
  }

  @Get(':userId/profile-picture')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get a user's profile picture URL" })
  @ApiParam({ name: 'userId', type: 'number' })
  @ApiResponse({ status: 200, description: 'Return the profile picture URL.' })
  @ApiResponse({ status: 404, description: 'Profile picture not found.' })
  async getProfilePicture(@Param('userId') userId: number) {
    const filePath = await this.userService.getProfilePicture(userId);
    return {
      profilePictureUrl: `http://localhost:${process.env.PORT}/${filePath}`,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':userId/update-profile-picture')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a user's profile picture" })
  @ApiParam({ name: 'userId', type: 'number' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The profile picture has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/profile-pictures',
        filename: (req, file, callback) => {
          const uniqueSuffix = uuidv4() + extname(file.originalname);
          callback(null, uniqueSuffix);
        },
      }),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (req, file, callback) => {
        const fileExt = extname(file.originalname).toLowerCase();
        if (!ALLOWED_FILE_TYPES.includes(fileExt)) {
          return callback(
            new BadRequestException(
              'Only .jpg, .jpeg, and .png files are allowed',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async updateProfilePicture(
    @Param('userId') userId: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const user = req.user as UserEntity;
    if (user.id !== userId) {
      throw new BadRequestException(
        'You can only update your own profile picture',
      );
    }
    return this.userService.updateProfilePicture(userId, file);
  }
}
