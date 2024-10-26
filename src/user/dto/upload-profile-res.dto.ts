import { ApiProperty } from '@nestjs/swagger';

export class UploadProfileResDto {
  @ApiProperty({
    description: 'user id',
    example: '1',
  })
  id: number;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'user is Active or not',
    example: 'true',
  })
  isActive: Boolean;

  @ApiProperty({
    description: 'profile pic url',
    example: '',
  })
  profilePicture: string;
}
