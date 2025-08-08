import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'central-empresa-secret-key-2025',
    });
  }

  async validate(payload: any) {
    console.log('JWT Strategy - Payload received:', JSON.stringify(payload, null, 2));
    try {
      const user = await this.authService.validateUser(payload);
      console.log('JWT Strategy - User found:', user ? { id: user.id, username: user.username } : 'null');
      return user;
    } catch (error) {
      console.error('JWT Strategy - Error validating user:', error);
      return null;
    }
  }
}
