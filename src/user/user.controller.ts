import {
	Body,
	Controller,
	Delete,
	Get,
	Post,
	Request,
	UploadedFile,
	UseInterceptors
} from '@nestjs/common';
import { UserService } from './user.service';
import { S3Service } from '../aws/s3.service';
import { FileInterceptor } from '@nestjs/platform-express/multer';

// @Auth()
@Controller('user')
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly s3Service: S3Service
	) {}

	@Get('profile')
	getProfile(@Request() req) {
		return this.userService.getProfile(req.user.id);
	}

	@Delete()
	deleteUser(@Request() req) {
		return this.userService.deleteUser(req.user.id);
	}

	@UseInterceptors(FileInterceptor('file'))
	@Post('s3')
	getS3(@UploadedFile() file: Express.Multer.File, @Body() body) {
		return this.s3Service.bucketList(file);
	}
}
