import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategyService extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'controle-doping-secret-dev',
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub || payload.id || payload.userId,
      sub: payload.sub || payload.id || payload.userId,
      userId: payload.sub || payload.id || payload.userId,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };
  }
}