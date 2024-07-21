import { Injectable } from '@nestjs/common';
import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
	GetObjectAclCommandInput,
	GetObjectCommand,
	GetObjectCommandInput
} from '@aws-sdk/client-s3';
import { Express } from 'express';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
	private client: S3Client;

	constructor() {
		this.client = new S3Client({
			region: 'us-east-1',
			forcePathStyle: true,
			endpoint: 'http://localhost:4566',
			credentials: {
				accessKeyId: 'my_secret_key',
				secretAccessKey: 'my_access_key'
			}
		});
	}

	async saveFile(file: Express.Multer.File) {
		try {
			const data = await this.client.send(
				new PutObjectCommand({
					Bucket: 'chat-media',
					Key: 'oleg/' + 'oleg.jpeg',
					Body: file.buffer
				})
			);
			return data;
		} catch (error) {
			console.log({ error });
			throw new Error('Error creating multipart upload');
		}
	}

	async deleteFile(fileName: string) {
		try {
			const data = await this.client.send(
				new DeleteObjectCommand({
					Bucket: 'chat-media',
					Key: 'oleg/' + 'oleg.jpeg'
				})
			);
			return data;
		} catch (error) {
			console.log({ error });
			throw new Error('Error creating multipart upload');
		}
	}

	public async getFileUrl(filePath: string): Promise<string> {
		return getSignedUrl(
			this.client,
			new GetObjectCommand({
				Bucket: 'chat-media',
				Key: 'oleg/' + 'oleg.jpeg',
				ResponseContentDisposition: 'inline'
			})
		);
	}
}
