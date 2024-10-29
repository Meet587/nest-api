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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUserByEmailDto } from './dto/get-user-by-email.dto';
import { JwtPayloadType } from './dto/jwt-payload.type';
import { UploadProfileResDto } from './dto/upload-profile-res.dto';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_FILE_TYPES = ['.jpg', '.jpeg', '.png'];

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  // @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find a user by email' })
  @ApiBody({
    description: 'find user by email',
    type: GetUserByEmailDto,
  })
  @ApiResponse({ status: 200, description: 'Return the found user.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findOne(@Body() body: GetUserByEmailDto) {
    return this.userService.findOneByEmail(body.email);
  }

  @Post(':userId/upload-profile-picture')
  // @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
    type: UploadProfileResDto,
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
    return this.userService.uploadProfilePicture(userId, file);
  }

  @Get(':userId/profile-picture')
  // @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get a user's profile picture URL" })
  @ApiParam({ name: 'userId', type: 'number' })
  @ApiResponse({ status: 200, description: 'Return the profile picture URL.' })
  @ApiResponse({ status: 404, description: 'Profile picture not found.' })
  async getProfilePicture(@Param('userId') userId: number) {
    const filePath = await this.userService.getProfilePicture(userId);
    return {
      profilePictureUrl: `http://localhost:${process.env.PORT ?? 3003}/${filePath}`,
    };
  }

  @Put(':userId/update-profile-picture')
  // @UseGuards(JwtAuthGuard)
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
    const user = req.user as JwtPayloadType;
    if (user.uId !== userId) {
      throw new BadRequestException(
        'You can only update your own profile picture',
      );
    }
    return this.userService.updateProfilePicture(userId, file);
  }
}
