import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

const ALLOWED_FILE_TYPES = ['.jpg', '.jpeg', '.png'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

export const editFileName = (req, file, callback) => {
  const uniqueSuffix = uuidv4() + extname(file.originalname);
  callback(null, uniqueSuffix);
};

export const fileFilterFunc = (req, file, callback) => {
  const fileExt = extname(file.originalname).toLowerCase();
  if (!ALLOWED_FILE_TYPES.includes(fileExt)) {
    return callback(
      new BadRequestException('Only .jpg, .jpeg, and .png files are allowed'),
      false,
    );
  }
  callback(null, true);
};

export const saveFileToStorage: MulterOptions = {
  storage: diskStorage({
    destination: './public/profile_pic',
    filename: (req, file, callback) => {
      const uniqueSuffix = uuidv4() + extname(file.originalname);
      callback(null, uniqueSuffix);
    },
  }),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: fileFilterFunc,
};
