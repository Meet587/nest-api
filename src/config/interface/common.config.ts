import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';
import { AuthConfig } from './auth.congif';
import { dbConfig } from './db.config';
import { ServiceConfig } from './service.congif';

export class commonConfig {
  @IsDefined({
    always: true,
    message: `$target: $property is empty`,
  })
  @Type(() => dbConfig)
  @ValidateNested()
  dbConfig?: dbConfig;

  @IsDefined({
    always: true,
    message: `$target: $property is empty`,
  })
  @Type(() => AuthConfig)
  @ValidateNested()
  authConfig?: AuthConfig;

  @IsDefined({
    always: true,
    message: `$target: $property is empty`,
  })
  @Type(() => ServiceConfig)
  @ValidateNested()
  serviceConfig?: ServiceConfig;
}
