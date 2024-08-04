import { BadRequestException, Injectable } from '@nestjs/common';
import { Profile } from '../profile/profile.entity';
import { User } from './user.entity';
import { DataSource } from 'typeorm';
import { UserWithProfileResponse } from './types';
import * as fs from 'fs';
import * as path from 'path';

interface UserWithProfile extends User {
	profile: Profile;
	fileUrl?: string;
}

@Injectable()
export class UserService {
	constructor(private readonly dataSource: DataSource) {}

	async getProfile(userId: User['id']) {
		const user = await this.dataSource.manager.findOne(User, {
			where: {
				id: userId
			},
			relations: { profile: true }
		});
		return this.transformUserWIthProfile(user);
	}

	async deleteUser(userId: User['id']) {
		const user = await this.dataSource.manager.findOne(User, {
			where: { id: userId },
			relations: { profile: true }
		});

		if (!user) return new BadRequestException('User not found');

		if (user.profile.file_path) {
			fs.unlink(
				path.join(process.cwd(), 'public', user.profile.file_path),
				e => {
					console.log(e);
				}
			);
		}

		return this.dataSource.manager.delete(User, userId);
	}

	async findOne(userId: User['id']) {
		return this.dataSource.manager.findOneBy(User, { id: userId });
	}

	async getUserPayload(userId: User['id']) {
		return this.dataSource.manager.findOne(User, {
			where: { id: userId },
			select: { email: true, id: true }
		});
	}

	public transformUserWIthProfile(
		user: UserWithProfile
	): UserWithProfileResponse['user'] {
		return {
			id: user.id,
			user_id: user.id,
			email: user.email,
			first_name: user.profile.first_name,
			last_name: user.profile.last_name,
			date_of_birth: user.profile.date_of_birth,
			file_path:
				user.profile.file_path &&
				`http://localhost:4566/chat-media/${user.profile.file_path}`,
			is_online: user.profile.is_online,
			updated_at: user.profile.updated_at,
			created_at: user.profile.created_at
		};
	}
}
