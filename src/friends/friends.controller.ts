import { Body, Controller, Get, Post, Query, Request } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { GetUsersDto } from './dto/friends.dto';
import { FriendsRequestDto } from './dto/friends-request.dto';
import { Auth } from '../decorators/auth.decorator';
import { RequestStatus } from './friends.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Friends')
@Auth()
@Controller('network')
export class FriendsController {
	constructor(private readonly friendsService: FriendsService) {}

	@Get('get_users')
	getUsers(@Query() dto: GetUsersDto, @Request() req) {
		return this.friendsService.getUsersList(dto, req.user.id);
	}

	@Post('request')
	sendRequest(@Body() dto: FriendsRequestDto, @Request() req) {
		switch (dto.status) {
			case RequestStatus.REQUEST:
				return this.friendsService.sendRequest(dto, req.user.id);
			case RequestStatus.APPROVED:
				return this.friendsService.approvedRequest(dto, req.user.id);
			default:
				return this.friendsService.dismissRequest(dto, req.user.id);
		}
	}
}
