import { Request as ExpressRequest } from 'express';
import { JwtPayloadType } from 'src/user/dto/jwt-payload.type';

interface Request extends ExpressRequest {
  user?: JwtPayloadType;
}