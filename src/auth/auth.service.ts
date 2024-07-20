import {
	BadRequestException,
	Injectable,
	UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, verify } from 'argon2';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import * as fs from 'fs';
import * as process from 'process';
import * as path from 'path';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { DataSource } from 'typeorm';
import { Profile } from '../profile/profile.entity';
import { Tokens } from './types';
import { UserWithProfileResponse } from '../user/types';
import { Response, Request } from 'express';
import {
	ACCESS_EXPIRE_TIME,
	ACCESS_TOKEN,
	REFRESH_EXPIRE_TIME,
	REFRESH_TOKEN
} from '../constants';

@Injectable()
export class AuthService {
	constructor(
		private jwt: JwtService,
		private userService: UserService,
		private readonly dataSource: DataSource
	) {}

	async register({
		file,
		body
	}: {
		file?: Express.Multer.File;
		body: UserRegisterDto;
	}): Promise<UserWithProfileResponse> {
		const isExistUser = await this.dataSource.manager.findOne(User, {
			where: { email: body.email }
		});
		if (isExistUser) throw new BadRequestException('User already exists');
		let newFileName = '';

		if (file) {
			newFileName =
				new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-') +
				'-' +
				file.originalname;
			const uploadDir = path.join(process.cwd(), 'public', 'user');
			if (!fs.existsSync(uploadDir)) {
				fs.mkdirSync(uploadDir, { recursive: true });
			}

			fs.writeFile(
				path.join(uploadDir, newFileName),
				file.buffer,
				function (e) {
					console.log(e);
				}
			);
		}

		let userToCreate = this.dataSource.manager.create(User, {
			email: body.email,
			password: await hash(body.password)
		});
		userToCreate.profile = this.dataSource.manager.create(Profile, {
			first_name: body.first_name,
			last_name: body.last_name,
			date_of_birth: body.date_of_birth,
			file_path: newFileName ? `user/${newFileName}` : null,
			is_online: true,
			user: userToCreate
		});

		userToCreate = await this.dataSource.manager.save(userToCreate);

		const tokens = await this.issueTokens(userToCreate.id);

		return {
			user: this.userService.transformUserWIthProfile(userToCreate),
			...tokens
		};
	}

	async login(dto: UserLoginDto, res: Response) {
		const user = await this.dataSource.manager.findOne(User, {
			where: {
				email: dto.email
			},
			relations: ['profile'],
			select: { password: true, id: true }
		});

		if (!user) throw new BadRequestException('User not found');

		const verifyPassword = await verify(user.password, dto.password);

		if (!verifyPassword) throw new BadRequestException('Password incorrect');

		const tokens = this.issueTokens(user.id);
		this.setCookies(tokens, res);

		return {
			user: this.userService.transformUserWIthProfile(user)
		};
	}

	async getNewTokens(req: Request, res: Response) {
		const result = await this.jwt.verifyAsync(req.cookies[REFRESH_TOKEN]);
		if (!result) throw new UnauthorizedException('Invalid refresh token');

		const user = await this.userService.getProfile(result.id);

		const tokens = this.issueTokens(user.id);
		this.setCookies(tokens, res);

		return { user };
	}

	private issueTokens(userId: User['id']): Tokens {
		const data = { id: userId };
		const accessToken = this.jwt.sign(data, {
			expiresIn: ACCESS_EXPIRE_TIME
		});
		const refreshToken = this.jwt.sign(data, {
			expiresIn: REFRESH_EXPIRE_TIME
		});

		return { accessToken, refreshToken };
	}

	private setCookies({ accessToken, refreshToken }: Tokens, res: Response) {
		res.cookie(ACCESS_TOKEN, accessToken, {
			maxAge: ACCESS_EXPIRE_TIME
		});

		res.cookie(REFRESH_TOKEN, refreshToken, {
			maxAge: REFRESH_EXPIRE_TIME
		});
	}
}
