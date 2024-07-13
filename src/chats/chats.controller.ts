import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { Auth } from '../decorators/auth.decorator';
import { CreateChatDto } from './dto/chats.dto';

@Controller('chat')
@Auth()
export class ChatsController {
	constructor(private readonly chatsService: ChatsService) {}

	@Post('create')
	async createChat(@Req() req, @Body() data: CreateChatDto) {
		return this.chatsService.createChat({ ...data, from_user_id: req.user.id });
	}

	@Get('list')
	async getChatList(@Req() req) {
		return this.chatsService.getChatList(req.user.id);
	}
}
