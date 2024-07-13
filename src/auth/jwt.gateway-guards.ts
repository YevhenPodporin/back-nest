import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Request } from 'express';
import { ACCESS_TOKEN } from '../constants';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtAuthGuardGateway implements CanActivate {
	constructor(
		private jwt: JwtService,
		private configService: ConfigService,
		private userService: UserService
	) {}
	async canActivate(context: ExecutionContext) {
		const ctx = context.switchToWs();
		const client = ctx.getClient();
		const { handshake } = client;

		if (handshake && handshake.headers.cookie) {
			const jwtToken = this.extractJWTFromCookies(handshake);

			if (!jwtToken) throw new WsException('Unauthorized');

			const result = this.jwt.verify(jwtToken, {
				secret: this.configService.get('JWT_SECRET')
			});

			const user = await this.userService.getUserPayload(result.id);
			client.user = user;

			return !!user;
		}
	}

	extractJWTFromCookies(handshake: Request): string | null {
		const cookie = handshake.headers.cookie;
		if (!cookie) return null;

		const cookies = cookie.split('; ');
		const tokenCookie = cookies.find(c => c.startsWith(ACCESS_TOKEN + '='));
		if (!tokenCookie) return null;

		return tokenCookie.split('=')[1];
	}
}
