import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { Friends } from './friends.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Friends, User])],
	controllers: [FriendsController],
	providers: [FriendsService, UserService]
})
export class FriendsModule {}
