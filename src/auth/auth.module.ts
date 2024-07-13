import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getJwtConfig } from '../config/jwt.config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from '../profile/profile.entity';

@Module({
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy, UserService],
	imports: [
		TypeOrmModule.forFeature([User, Profile]),
		PassportModule,
		JwtModule.registerAsync({
			inject: [ConfigService],
			useFactory: getJwtConfig
		})
	]
})
export class AuthModule {}
