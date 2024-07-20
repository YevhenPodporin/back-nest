import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Notifications } from './notifications.entity';
import {
	AddOrRemoveNotification,
	NotificationsResponse
} from './dto/notification.dto'; // Adjust the path as needed

@Injectable()
export class NotificationsService {
	constructor(private readonly dataSource: DataSource) {}

	async addNotification(data: AddOrRemoveNotification) {
		let notification = await this.dataSource.manager.findOne(Notifications, {
			where: {
				chat: { id: data.to_chat_id },
				to_user: { id: data.to_user_id }
			},
			relations: ['chat', 'to_user']
		});

		if (notification) {
			notification.unread_messages += 1;
		} else {
			notification = this.dataSource.manager.create(Notifications, {
				chat: { id: data.to_chat_id },
				to_user: { id: data.to_user_id },
				unread_messages: 1
			});
		}

		await this.dataSource.manager.save(notification);

		return this.transformData(notification);
	}

	async removeNotification(data: AddOrRemoveNotification) {
		try {
			await this.dataSource
				.createQueryBuilder()
				.delete()
				.from(Notifications)
				.where('toUserId = :userId', { userId: data.to_user_id })
				.andWhere('chatId = :chatId', { chatId: data.to_chat_id })
				.execute();
		} catch (error) {}
	}

	private transformData(
		notifications: Notifications
	): Omit<NotificationsResponse, 'message'> {
		return {
			to_chat_id: notifications.chat.id,
			unread_messages: notifications.unread_messages,
			to_user_id: notifications.to_user.id,
			id: notifications.id
		};
	}
}
