import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
	imports: [
		ClientsModule.register([
			{
				name: 'microservice_b',
				transport: Transport.TCP,
				options: { port: 4001 }
			}
		])
	],
	exports: [ClientsModule]
})
export class ClientModule {}
