import { Injectable } from '@nestjs/common';
import { VALID_FILE_TYPES_FOR_CHAT } from '../constants';
import { FileFromMessage } from '../messages/types';
import * as fs from 'fs';

@Injectable()
export class StorageService {
	isValidFileType(fileType: string) {
		return !!VALID_FILE_TYPES_FOR_CHAT.find(format =>
			format.includes(fileType)
		);
	}

	getFilePath(fileName: string) {
		return process.cwd() + `/src/storage/files/${fileName}`;
	}

	saveFileForMessage(file: FileFromMessage) {
		if (!file) return null;
		const splitted = file.data.split(';base64,');
		let format = splitted[0].split('/')[1];
		if (format.includes('webm') || format.includes('mp4')) {
			format = format.split(';')[0];
		}

		if (!this.isValidFileType(format)) {
			console.log(format + ':Incorrect file format');
			return;
		}

		const newFileName =
			new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-') +
			'-' +
			file.fileName?.split('.')[0] +
			'.' +
			format;

		try {
			fs.writeFileSync(this.getFilePath(newFileName), splitted[1], {
				encoding: 'base64'
			});
		} catch (e) {
			console.log(e);
		}

		return newFileName;
	}
}
