import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ServiceConfig {
  @IsString()
  @IsNotEmpty()
  webHostUrl: string;

  @IsString()
  @IsOptional()
  port?: number;
}
