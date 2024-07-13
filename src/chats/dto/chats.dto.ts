import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/user.entity';

export class CreateChatDto {
	@ApiProperty({ required: false })
	@IsNumber()
	to_user_id: User['id'];
}

export interface ProfileDto {
	id: number;
	first_name: string;
	last_name: string;
	date_of_birth: string;
	is_online: boolean;
	created_at: Date;
	updated_at: Date;
	file_path: string;
}

export interface UserDto {
	profile: ProfileDto;
}

export class ChatListDto {
	id: number;
	from_user: UserDto;
	to_user: UserDto;
	to_user_id: number;
	from_user_id: number;
	unread_messages?: number;
	last_message?: string;
	created_at: Date;
	updated_at: Date;
}
