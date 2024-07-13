import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { ProfileModule } from './profile/profile.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsModule } from './friends/friends.module';
import DbConfig from './config/database.config';
import { DataSourceOptions } from 'typeorm';
import { ChatsModule } from './chats/chats.module';
import { MessagesModule } from './messages/messages.module';
import { MessagesGateway } from './messages/messages.gateway';
import { JwtService } from '@nestjs/jwt';

@Module({
	imports: [
		ConfigModule.forRoot({
			load: [DbConfig],
			isGlobal: true
		}),
		TypeOrmModule.forRootAsync({
			useFactory: (
				configService: ConfigService<{ database: DataSourceOptions }>
			) => configService.get('database'),
			inject: [ConfigService]
		}),
		AuthModule,
		UserModule,
		ProfileModule,
		FriendsModule,
		ChatsModule,
		MessagesModule
	],
	controllers: [],
	providers: [MessagesGateway, JwtService]
})
export class AppModule {}
