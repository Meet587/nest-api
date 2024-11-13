import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthConfig } from 'src/config/interface/auth.congif';
import { JwtPayloadType } from 'src/user/dto/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<AuthConfig>(
        'environment.authConfig',
      ).jwtSecrete,
    });
  }

  async validate(payload: JwtPayloadType) {
    return payload;
  }
}
