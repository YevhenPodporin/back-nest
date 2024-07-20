import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { ChatListDto, CreateChatDto } from './dto/chats.dto';
import { User } from '../user/user.entity';
import { Friends, RequestStatus } from '../friends/friends.entity';
import { Chats } from './chats.entity';
import getImageUrl from '../helpers/getImageUrl';

@Injectable()
export class ChatsService {
	private manager: EntityManager;

	constructor(private readonly dataSource: DataSource) {
		this.manager = dataSource.manager;
	}

	async createChat({
		from_user_id,
		to_user_id
	}: CreateChatDto & { from_user_id: User['id'] }) {
		const fromUserToUser = {
			from_user: { id: from_user_id },
			to_user: { id: to_user_id }
		};

		const isMyFriend = await this.manager.findOne(Friends, {
			where: [
				{
					...fromUserToUser,
					status: RequestStatus.APPROVED
				},
				{
					from_user: { id: to_user_id },
					to_user: { id: from_user_id },
					status: RequestStatus.APPROVED
				}
			]
		});
		if (!isMyFriend) {
			return new BadRequestException('You are not friends');
		}
		let existingChat = await this.manager.findOne(Chats, {
			where: [
				fromUserToUser,
				{
					from_user: { id: to_user_id },
					to_user: { id: from_user_id }
				}
			],
			relations: { to_user: true, from_user: true }
		});
		if (!existingChat) {
			const nweChat = this.manager.create(Chats, fromUserToUser);
			existingChat = await this.manager.save(nweChat);
		}
		return { chat: existingChat };
	}

	async getChatList(userId: User['id']): Promise<ChatListDto[]> {
		const list = await this.manager.find(Chats, {
			where: [{ from_user: { id: userId } }, { to_user: { id: userId } }],
			relations: [
				'to_user.profile',
				'from_user.profile',
				'messages',
				'notifications'
			],
			order: {
				messages: { created_at: 'DESC' }
			}
		});

		return list.map(item => {
			return {
				id: item.id,
				from_user: {
					profile: {
						...item.from_user.profile,
						file_path: getImageUrl(item.from_user.profile?.file_path)
					}
				},
				to_user: {
					profile: {
						...item.to_user.profile,
						file_path: getImageUrl(item.to_user.profile?.file_path)
					}
				},
				to_user_id: item.to_user.id,
				from_user_id: item.from_user.id,
				unread_messages: item.notifications[0]?.unread_messages || 0,
				last_message: item.messages[0]?.message,
				created_at: item.created_at,
				updated_at: item.updated_at
			};
		});
	}
}
