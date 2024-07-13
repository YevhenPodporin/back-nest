import { INCORRECT_EMAIL_FORMAT, INCORRECT_DATE_FORMAT } from '../../constants';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsOptional, IsString } from 'class-validator';
import { User } from '../../user/user.entity';
import { Profile } from '../../profile/profile.entity';

export class UserRegisterDto {
	@ApiProperty()
	@IsEmail({}, { message: INCORRECT_EMAIL_FORMAT })
	email: User['email'];

	@ApiProperty()
	@IsString()
	password: User['password'];

	@ApiProperty()
	@IsString()
	first_name: Profile['first_name'];

	@ApiProperty()
	@IsString()
	last_name: Profile['last_name'];

	@ApiProperty()
	@IsOptional()
	@IsDateString({}, { message: INCORRECT_DATE_FORMAT })
	date_of_birth: Profile['date_of_birth'];

	@IsOptional()
	@ApiProperty({ type: 'string', format: 'binary', required: false })
	file?: Express.Multer.File;
}
