import { Controller, Delete, Get, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { Auth } from '../decorators/auth.decorator';
import { ApiBasicAuth } from '@nestjs/swagger';

@ApiBasicAuth()
@Auth()
@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('profile')
	getProfile(@Request() req) {
		return this.userService.getProfile(req.user.id);
	}

	@Delete()
	deleteUser(@Request() req) {
		return this.userService.deleteUser(req.user.id);
	}
}
