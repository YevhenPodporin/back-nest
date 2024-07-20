import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import { Messages } from './messages.entity';
import { Chats } from '../chats/chats.entity';
import getImageUrl from '../helpers/getImageUrl';
import {
	CreateMessageType,
	editMessage,
	GetMessages,
	searchMessages
} from './types';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class MessagesService {
	constructor(
		private readonly dataSource: DataSource,
		@Inject('microservice_b') private readonly client: ClientProxy
	) {}

	async createMessageInChat(data: CreateMessageType<string>) {
		const message = this.dataSource.getRepository(Messages).create({
			chat: { id: data.chat_id },
			message: data.message,
			updated_at: null,
			file: data.file,
			sender: { id: data.sender_id }
		});
		const savedMessage = await this.dataSource
			.getRepository(Messages)
			.save(message);

		return {
			...savedMessage,
			file: getImageUrl(message.file),
			sender_id: savedMessage.sender.id
		};
	}

	async getMessagesInChat(params: GetMessages) {
		try {
			const result = await lastValueFrom(this.client.send('sum', [1, 2]));
			console.log({ result });
		} catch (e) {
			console.log(e);
		}

		const { chat_id, pagination, user } = params;
		const chat = await this.dataSource.manager.findOne(Chats, {
			where: [
				{ id: chat_id, to_user: { id: user.id } },
				{ id: chat_id, from_user: { id: user.id } }
			]
		});

		if (!chat) throw new BadRequestException('Chat not found');
		const [messages, count] = await this.dataSource.manager.findAndCount(
			Messages,
			{
				order: { id: 'DESC' },
				where: { chat: { id: chat_id } },
				take: pagination.take,
				skip: pagination.skip,
				relations: ['sender']
			}
		);

		return {
			list: messages.map(msg => ({
				...msg,
				sender_id: msg.sender.id,
				file: getImageUrl(msg.file)
			})),
			count
		};
	}

	async searchInChat(data: searchMessages) {
		const { chat_id, value, user } = data;
		if (!user.id) return { error: '' };

		const query: SelectQueryBuilder<Messages> =
			this.dataSource.manager.createQueryBuilder(Messages, 'm');

		const messages = await query
			.where('m.chat.id = :chatId', { chatId: chat_id })
			.andWhere('m.message LIKE :value', { value: `%${value}%` })
			.innerJoinAndSelect('m.sender', 'sender')
			.innerJoinAndSelect('sender.profile', 'user')
			.getMany();

		return messages.map(message => ({
			...message,
			user: {
				...message.sender,
				file_path: getImageUrl(message?.sender?.profile?.file_path)
			}
		}));
	}

	async editMessage(data: editMessage) {
		const message = await this.dataSource
			.getRepository(Messages)
			.findOne({ where: { id: data.message_id } });

		if (!message) {
			throw new Error('Message not found');
		}

		message.message = data.value;
		message.updated_at = new Date();

		return await this.dataSource.getRepository(Messages).save(message);
	}

	async findChat(chat_id: Chats['id']) {
		return this.dataSource.manager.findOne(Chats, {
			where: { id: chat_id },
			relations: { to_user: true, from_user: true }
		});
	}
}
