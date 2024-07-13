import { INCORRECT_EMAIL_FORMAT } from '../../constants';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { User } from '../../user/user.entity';

export class UserLoginDto {
	@ApiProperty()
	@IsEmail({}, { message: INCORRECT_EMAIL_FORMAT })
	@IsNotEmpty()
	email: User['email'];

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	password: User['password'];
}
