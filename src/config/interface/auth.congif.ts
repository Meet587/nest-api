import { IsNotEmpty, IsString } from 'class-validator';

export class AuthConfig {
  @IsString()
  @IsNotEmpty()
  jwtSecrete: string;

  @IsString()
  @IsNotEmpty()
  tokenExp: string;

  @IsString()
  @IsNotEmpty()
  refreshTokenExp: string;
}
