import { Injectable } from '@nestjs/common';
import {
	S3Client,
	CreateMultipartUploadCommand,
	PutObjectCommand,
	PutObjectCommandInput
} from '@aws-sdk/client-s3';
import { Express } from 'express';

@Injectable()
export class S3Service {
	private client: S3Client;

	constructor() {
		this.client = new S3Client({
			region: 'us-east-2',
			endpoint: 'https://localhost.localstack.cloud:4566/',
			bucketEndpoint: true,
			credentials: {
				accessKeyId: 'my_secret_key',
				secretAccessKey: 'my_access_key'
			}
		});
	}

	async bucketList(file: Express.Multer.File) {
		try {
			const params: PutObjectCommandInput = {
				Bucket: 'chat-media',
				Key: 'uniqueKey',
				Body: file.buffer,
				ContentType: file.mimetype
			};

			const data = await this.client.send(new PutObjectCommand(params));
			return '';
		} catch (error) {
			console.log({ error });
			throw new Error('Error creating multipart upload');
		}
	}
}
