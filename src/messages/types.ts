import { Messages } from './messages.entity';
import { Chats } from '../chats/chats.entity';
import { User } from '../user/user.entity';

export type CreateMessageType<T> = {
	message: string;
	chat_id: Chats['id'];
	sender_id: User['id'];
	file?: T;
};

export type FileFromMessage = {
	data: string;
	fileName: string | undefined;
};

export type SomeoneTyping = {
	first_name: string;
	chat_id: Chats['id'];
};

export type GetMessages = {
	chat_id: Chats['id'];
	pagination?: {
		take: number;
		skip: number;
		direction: Direction;
		order_by: OrderBy;
	};
	user: JwtPayload;
};

export interface searchMessages {
	value: string;
	chat_id: Chats['id'];
	user: JwtPayload;
}

export interface editMessage {
	value: string;
	chat_id: Chats['id'];
	message_id: Messages['id'];
	user: JwtPayload;
}

export enum Direction {
	desc = 'desc',
	asc = 'asc'
}

export enum OrderBy {
	created_at = 'created_at'
}

export type JwtPayload = {
	email: User['email'];
	id: User['id'];
};
