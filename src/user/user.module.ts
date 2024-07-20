import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Module } from '../aws/s3.module';

@Module({
	imports: [TypeOrmModule.forFeature([User]), S3Module],
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService]
})
export class UserModule {}
