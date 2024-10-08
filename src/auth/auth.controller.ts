import {
	Body,
	Controller,
	Post,
	Req,
	Res,
	UploadedFile,
	UseInterceptors
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { IsValidImageDecorator } from '../decorators/is-valid-image.decorator';
import { Request, Response } from 'express';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';

@ApiTags('Authenticate')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@ApiConsumes('multipart/form-data')
	@Post('/register')
	@UseInterceptors(FileInterceptor('file'))
	register(
		@IsValidImageDecorator()
		@UploadedFile()
		file: Express.Multer.File,
		@Body() body: UserRegisterDto,
		@Res({ passthrough: true }) res: Response
	) {
		return this.authService.register({ file, body, res });
	}

	@Post('/login')
	login(
		@Body() registerDto: UserLoginDto,
		@Res({ passthrough: true }) res: Response
	) {
		return this.authService.login(registerDto, res);
	}

	@Post('/access-token')
	getNewTokens(@Res({ passthrough: true }) res: Response, @Req() req: Request) {
		return this.authService.getNewTokens(req, res);
	}

	@Post('/sign-out')
	signOut(@Res() res: Response) {
		res.clearCookie(ACCESS_TOKEN, { maxAge: -1 });
		res.clearCookie(REFRESH_TOKEN, { maxAge: -1 });

		res.send({ message: 'Signed out successfully' });
	}
}

//TODO при регистрации ошибка field name (скорее всего файл)
