import { Controller, Get, Param, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'fs';
import { Auth } from '../decorators/auth.decorator';
import { StorageService } from './storage.service';

@Controller('image')
export class StorageController {
	constructor(private storageService: StorageService) {}

	@Auth()
	@Get(':fileName')
	getFile(@Param() param): StreamableFile {
		const file = createReadStream(
			this.storageService.getFilePath(param.fileName)
		);

		return new StreamableFile(file);
	}
}
