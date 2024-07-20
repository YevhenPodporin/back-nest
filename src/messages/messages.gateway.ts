import {
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, UseGuards } from '@nestjs/common';
import { JwtAuthGuardGateway } from '../auth/jwt.gateway-guards';
import { MessagesService } from './messages.service';
import {
	CreateMessageType,
	GetMessages,
	JwtPayload,
	SomeoneTyping,
	FileFromMessage
} from './types';
import { Chats } from '../chats/chats.entity';
import { StorageService } from '../storage/storage.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ClientProxy } from '@nestjs/microservices';

interface SocketWithUser extends Socket {
	user: JwtPayload;
}

@UseGuards(JwtAuthGuardGateway)
@WebSocketGateway({
	cors: {
		origin: 'http://localhost:3000',
		credentials: true
	}
})
export class MessagesGateway
	implements OnGatewayConnection, OnGatewayDisconnect
{
	constructor(
		private readonly messageService: MessagesService,
		private storageService: StorageService,
		private notificationService: NotificationsService
	) {}
	@WebSocketServer()
	server: Server;

	async handleConnection(client: SocketWithUser) {
		console.log('Client connected:', client.id);
	}

	async handleDisconnect(client: SocketWithUser) {
		console.log('Client disconnected:', client.id);
		client.rooms.clear();
	}

	@SubscribeMessage('joinRoom')
	async joinRoom(client: SocketWithUser, { id }: Pick<Chats, 'id'>) {
		const foundRoom = await this.messageService.findChat(id);
		if (foundRoom) {
			client.join(String(foundRoom.id));
		} else {
			client.disconnect(true);
		}
	}

	@SubscribeMessage('getMessages')
	async getMessages(
		client: SocketWithUser,
		data: Pick<GetMessages, 'chat_id' | 'pagination'>
	) {
		const messages = await this.messageService.getMessagesInChat({
			...data,
			user: client.user
		});

		if (data.pagination?.skip === 0) {
			await this.notificationService.removeNotification({
				to_chat_id: Number(data.chat_id),
				to_user_id: client.user.id
			});
		}

		return messages;
	}

	private async getRecipient(socket: SocketWithUser, chat: Chats) {
		const sockets = await this.server.sockets.fetchSockets();
		const socketsToFind = [...sockets.values()];

		const toUserId =
			socket.user.id === chat.to_user.id ? chat.from_user.id : chat.to_user.id;
		const socketToSend = socketsToFind.find((data: any) => {
			if (data.user) {
				return data.user.id === toUserId;
			}
		});
		return { socketToSend, toUserId };
	}

	@SubscribeMessage('send-message')
	async sendMessage(
		client: SocketWithUser,
		data: CreateMessageType<FileFromMessage>
	) {
		try {
			const savedFileName = this.storageService.saveFileForMessage(data.file);
			const savedMessage = await this.messageService.createMessageInChat({
				...data,
				file: savedFileName,
				sender_id: client.user.id
			});

			const chat = await this.messageService.findChat(data.chat_id);
			const { toUserId, socketToSend } = await this.getRecipient(client, chat);

			if (socketToSend) {
				if (
					!socketToSend ||
					(!socketToSend.rooms.has(String(data.chat_id)) && toUserId)
				) {
					const notification = await this.notificationService.addNotification({
						to_user_id: toUserId,
						to_chat_id: chat.id
					});

					this.server
						.to(String(socketToSend.id))
						.emit('notification', { message: data.message, ...notification });
				}
			}

			this.server
				.to(String(data.chat_id))
				.emit('receive-message', savedMessage);
			this.server.to(String(data.chat_id)).emit('stop-typing');
		} catch (e) {
			console.log(e);
		}
	}

	@SubscribeMessage('typing')
	async typing(client: SocketWithUser, data: SomeoneTyping) {
		const { first_name, chat_id } = data;
		const chat = await this.messageService.findChat(chat_id);
		const { socketToSend } = await this.getRecipient(client, chat);
		if (socketToSend && socketToSend.rooms.has(String(chat_id))) {
			client
				.to(String(chat_id))
				.emit('someoneTyping', { first_name, id: client.user.id }, ack => {
					console.log(ack);
				});
		} else {
			client.to(String(chat_id)).emit('stop-typing');
		}
	}

	@SubscribeMessage('stop-typing')
	async stopTyping(client: SocketWithUser, chat_id: string) {
		client.to(chat_id).emit('stop-typing');
	}

	@SubscribeMessage('searchMessages')
	async searchMessages(client: SocketWithUser, data: any) {
		const messages = await this.messageService.searchInChat({
			...data,
			user: client.user
		});

		return messages;
	}

	@SubscribeMessage('editMessage')
	async editMessage(
		client: SocketWithUser,
		data: any,
		callback: (status: string) => void
	) {
		try {
			const savedMessage = await this.messageService.editMessage(data);
			this.server.to(String(data.chat_id)).emit('editMessage', savedMessage);
			callback('ok');
		} catch (e) {
			console.log(e);
		}
	}
}
