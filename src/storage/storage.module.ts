import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';

@Module({
	controllers: [StorageController],
	imports: [],
	exports: [StorageService],
	providers: [StorageService]
})
export class StorageModule {}
