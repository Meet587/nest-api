import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class UploadProfilePicDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'The profile picture file to upload',
    required: true,
  })
  @IsNotEmpty()
  profilePic: Express.Multer.File;
}
