import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { dbConfig } from './config/interface/db.config';
import environmentConfig from './config/environment.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      expandVariables: true,
      isGlobal: true,
      load: [environmentConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.getOrThrow<dbConfig>('environment.dbConfig').host,
        port: configService.getOrThrow<dbConfig>('environment.dbConfig').port,
        username: configService.getOrThrow<dbConfig>('environment.dbConfig')
          .username,
        password: configService.getOrThrow<dbConfig>('environment.dbConfig')
          .password,
        database: configService.getOrThrow<dbConfig>('environment.dbConfig')
          .dbName,
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
