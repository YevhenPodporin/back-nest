import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AWS_SERVICE_NAME } from './constants';

@Module({
	imports: [
		ClientsModule.register([
			{
				name: AWS_SERVICE_NAME,
				transport: Transport.TCP,
				options: { port: 4001 }
			}
		])
	],
	exports: [ClientsModule]
})
export class ClientModule {}
