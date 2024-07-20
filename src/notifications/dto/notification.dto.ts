import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/user.entity';
import { Chats } from '../../chats/chats.entity';

export class AddOrRemoveNotification {
	@ApiProperty({ required: false })
	@IsNumber()
	to_user_id: User['id'];

	@ApiProperty({ required: false })
	@IsNumber()
	to_chat_id: Chats['id'];
}

export type NotificationsResponse = {
	id: number;
	to_chat_id: number;
	to_user_id: number;
	unread_messages: number;
	message: string;
};
