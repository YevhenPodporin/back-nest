import { BadRequestException } from '@nestjs/common';
import { MAX_FILE_SIZE, VALID_IMAGE_TYPES } from '../constants';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const IsValidImageDecorator = createParamDecorator(
	(data: unknown, ctx: ExecutionContext) => {
		const file = ctx.switchToHttp().getRequest().file;

		if (!file) return null;

		const isValidMimetype = VALID_IMAGE_TYPES.includes(file.mimetype);

		if (!isValidMimetype) {
			throw new BadRequestException(
				'Invalid file type. Valid types: png, jpeg, jpg, webp'
			);
		}

		if (file.size > MAX_FILE_SIZE) {
			throw new BadRequestException('Max file size: 5Mb');
		}

		return file;
	}
);
