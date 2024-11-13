import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { dbConfig as DbConfig } from 'src/config/interface/db.config';
import { UserModule } from 'src/user/user.module';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const dbConfig = this.configService.getOrThrow<DbConfig>(
      'environment.dbConfig',
    );
    if (!dbConfig) {
      throw new Error('DB config not provided');
    }
    return {
      type: 'mysql',
      host: dbConfig.host,
      port: dbConfig.port,
      username: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.dbName,
      synchronize: true,
      entities: [AuthModule, UserModule],
      autoLoadEntities: true,
    } as TypeOrmModuleOptions;
  }
}
