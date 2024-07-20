import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ClientModule } from '../client.module';

@Module({
	providers: [MessagesService, NotificationsService],
	exports: [MessagesService, NotificationsService],
	imports: [ClientModule]
})
export class MessagesModule {}
