import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { ACCESS_TOKEN } from '../constants';

@Injectable()
// Метод для обработки jwt из headers
// export class JwtStrategy extends PassportStrategy(Strategy) {
// 	constructor(
// 		private configService: ConfigService,
// 		@InjectRepository(User)
// 		private usersRepository: Repository<User>
// 	) {
// 		super({
// 			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
// 			ignoreExpiration: false,
// 			secretOrKey: configService.get('JWT_SECRET')
// 		});
// 	}
//
// 	async validate({ id }: Pick<User, 'id' | 'email'>) {
// 		const user = await this.usersRepository.findOne({
// 			where: {
// 				id
// 			},
// 			select: { id: true, email: true }
// 		});
// 		if (!user) {
// 			throw new UnauthorizedException();
// 		}
//
// 		return user;
// 	}
// }

// Метод для обработки jwt из cookies
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly configService: ConfigService,
		@InjectRepository(User)
		private usersRepository: Repository<User>
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				JwtStrategy.extractJWT,
				ExtractJwt.fromAuthHeaderAsBearerToken()
			]),
			ignoreExpiration: false,
			secretOrKey: configService.get('JWT_SECRET')
		});
	}

	private static extractJWT(req: Request): string | null {
		if (req.cookies && req.cookies[ACCESS_TOKEN]) {
			return req.cookies[ACCESS_TOKEN];
		}

		return null;
	}

	async validate({ id }: Pick<User, 'id' | 'email'>) {
		const user = await this.usersRepository.findOne({
			where: {
				id
			},
			select: { id: true, email: true }
		});
		if (!user) {
			throw new UnauthorizedException();
		}

		return user;
	}
}
