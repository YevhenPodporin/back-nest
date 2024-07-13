import { VALID_FILE_TYPES_FOR_CHAT } from '../constants';
import fs from 'fs';
import { FileFromMessage } from '../messages/types';
// import { diskStorage } from 'multer';

export const isValidFileType = (fileType: string) => {
	return VALID_FILE_TYPES_FOR_CHAT.includes(fileType);
};

export const saveFileForMessage = (file: FileFromMessage) => {
	if (!file) return null;
	const splitted = file.data.split(';base64,');
	let format = splitted[0].split('/')[1];
	if (format.includes('webm')) {
		format = format.split(';')[0];
	}

	if (!isValidFileType(format)) {
		throw new Error('Incorrect file format');
	}

	const newFileName =
		new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-') +
		'-' +
		file.fileName?.split('.')[0] +
		'.' +
		format;

	fs.writeFileSync(
		process.cwd() + `/src/storage/files/${newFileName}`,
		splitted[1],
		{ encoding: 'base64' }
	);

	return newFileName;
};
