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
import { StorageModule } from './storage/storage.module';
import { GlobalFilter } from './global/global.filter';
import { NotificationsModule } from './notifications/notifications.module';
import { ClientModule } from './client.module';
import { S3Module } from './aws/s3.module';

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
	providers: [
		MessagesGateway,
		JwtService,
		GlobalFilter
		// {
		// 	provide: 'socket_service',
		// 	useFactory: () => {
		// 		return ClientProxyFactory.create({
		// 			transport: Transport.TCP,
		// 			options: { port: 4001 }
		// 		});
		// 	}
		// }
	]
})
export class AppModule {}
