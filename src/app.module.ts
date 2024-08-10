import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { ProfileModule } from './profile/profile.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsModule } from './friends/friends.module';
import DbConfig from './config/database.config';
import { ChatsModule } from './chats/chats.module';
import { MessagesModule } from './messages/messages.module';
import { MessagesGateway } from './messages/messages.gateway';
import { JwtService } from '@nestjs/jwt';
import { StorageModule } from './storage/storage.module';
import { GlobalFilter } from './global/global.filter';
import { NotificationsModule } from './notifications/notifications.module';
import { ClientModule } from './client.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			load: [DbConfig],
			isGlobal: true
		}),
		TypeOrmModule.forRootAsync({
			useFactory: () => ({
				type: 'mysql',
				host: process.env.DATABASE_HOST,
				port: Number(process.env.DATABASE_PORT),
				username: process.env.DATABASE_USERNAME,
				password: process.env.DATABASE_PASSWORD,
				database: process.env.DATABASE_NAME,
				synchronize: false,
				migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
				entities: [__dirname + '/**/*.entity{.ts,.js}']
			}),
			inject: [ConfigService]
		}),
		AuthModule,
		ClientModule,
		UserModule,
		ProfileModule,
		FriendsModule,
		ChatsModule,
		MessagesModule,
		StorageModule,
		NotificationsModule
	],
	exports: [],
	controllers: [],
	providers: [MessagesGateway, JwtService, GlobalFilter]
})
export class AppModule {}
