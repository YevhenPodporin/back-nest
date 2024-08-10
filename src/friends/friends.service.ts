import { BadRequestException, Injectable } from '@nestjs/common';
import { FriendsRequestDto } from './dto/friends-request.dto';
import { User } from '../user/user.entity';
import { DataSource, EntityManager, SelectQueryBuilder } from 'typeorm';
import { Friends, RequestStatus } from './friends.entity';
import { UserService } from '../user/user.service';
import { GetUsersDto } from './dto/friends.dto';

@Injectable()
export class FriendsService {
	private manager: EntityManager;

	constructor(
		private readonly userService: UserService,
		private readonly dataSource: DataSource
	) {
		this.manager = dataSource.manager;
	}

	async getUsersList(dto: GetUsersDto, userId: User['id']) {
		const { filter, pagination } = dto;
		let query: SelectQueryBuilder<Friends | User> =
			this.manager.createQueryBuilder(Friends, 'f');

		try {
			if (filter && filter?.status === RequestStatus.APPROVED) {
				query
					.where(
						`(f.from_user = ${userId} OR f.to_user = ${userId}) AND status = '${RequestStatus.APPROVED}'`
					)
					.innerJoinAndMapOne(
						'f.user',
						User,
						'u',
						`CASE WHEN f.from_user = ${userId} THEN u.id = f.to_user ELSE u.id = f.from_user END`
					);
			} else if (filter && filter?.status === RequestStatus.REQUEST) {
				query
					.where(
						`f.to_user = ${userId} AND status = '${RequestStatus.REQUEST}'`
					)
					.innerJoinAndMapOne('f.user', User, 'u', `u.id = f.from_user`);
			} else {
				query = this.manager
					.createQueryBuilder(User, 'u')
					.where('u.id != :userId', { userId });
			}

			query.innerJoinAndSelect('u.profile', 'p');

			if (filter && filter.search) {
				query.where(
					`((p.first_name LIKE :search OR p.last_name LIKE :search OR u.email LIKE :search))`,
					{
						search: `%${filter.search}%`
					}
				);
			}

			const [list, count] = await query
				.take(pagination.take)
				.skip(pagination.skip)
				.getManyAndCount();

			const transformedData = list.map((friend: Friends & { user: User }) => {
				return this.userService.transformUserWIthProfile(
					'user' in friend ? friend.user : friend
				);
			});

			return { list: transformedData, count };
		} catch (e) {
			console.log(e);
		}
	}

	async sendRequest(dto: FriendsRequestDto, userId: User['id']) {
		const { to_user_id } = dto;

		if (+userId === +to_user_id) {
			throw new BadRequestException(`User ids cant be equal`);
		}
		// Check if the recipient user exists
		const recipientUser = await this.userService.findOne(to_user_id);
		if (!recipientUser) {
			throw new BadRequestException(`User with id: ${to_user_id} not found`);
		}

		// Check for an existing friend request from `userId` to `to_user_id`
		const existingRequestFromUser = await this.manager.findOne(Friends, {
			where: {
				from_user: { id: userId },
				to_user: { id: to_user_id }
			}
		});

		if (existingRequestFromUser) {
			throw new BadRequestException(`Request to user has already been sent`);
		}

		// Check for an existing friend request from `to_user_id` to `userId`
		const existingRequestToUser = await this.manager.findOne(Friends, {
			where: {
				from_user: { id: to_user_id },
				to_user: { id: userId }
			}
		});

		if (existingRequestToUser) {
			existingRequestToUser.status = RequestStatus.APPROVED;
			await this.manager.save(existingRequestToUser);

			return existingRequestToUser;
		}

		// Create a new friend request
		const newFriendRequest = this.manager.create(Friends, {
			from_user: { id: userId },
			to_user: { id: to_user_id },
			status: RequestStatus.REQUEST
		});

		return await this.manager.save(newFriendRequest);
	}

	async approvedRequest(dto: FriendsRequestDto, userId: User['id']) {
		const { to_user_id } = dto;

		// Check for an existing friend request from `userId` to `to_user_id`
		const existingRequestToUser = await this.manager.findOne(Friends, {
			where: {
				from_user: { id: to_user_id },
				to_user: { id: userId },
				status: RequestStatus.REQUEST
			}
		});
		if (!existingRequestToUser) {
			throw new BadRequestException(`Request from user was not found`);
		}
		existingRequestToUser.status = RequestStatus.APPROVED;
		await this.manager.save(existingRequestToUser);

		return existingRequestToUser;
	}

	async dismissRequest(dto: FriendsRequestDto, userId: User['id']) {
		const { to_user_id } = dto;

		// Check for an existing friend request from `userId` to `to_user_id`
		const existingRequestToUser = await this.manager.findOne(Friends, {
			where: [
				{
					from_user: { id: to_user_id },
					to_user: { id: userId }
				},
				{
					to_user: { id: to_user_id },
					from_user: { id: userId }
				}
			]
		});

		if (!existingRequestToUser) {
			throw new BadRequestException(`Request from user was not found`);
		}
		await this.manager.remove(existingRequestToUser);

		return existingRequestToUser;
	}
}
