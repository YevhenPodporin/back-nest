import { IsString, IsEnum, IsNumber } from 'class-validator';
import { Friends, RequestStatus } from '../friends.entity';
import { ApiProperty } from '@nestjs/swagger';

export class FriendsRequestDto {
	@ApiProperty()
	@IsString()
	@IsEnum(RequestStatus)
	status: keyof typeof RequestStatus;

	@ApiProperty()
	@IsNumber()
	to_user_id: Friends['to_user']['id'];
}
