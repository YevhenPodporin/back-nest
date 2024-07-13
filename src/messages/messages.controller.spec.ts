import { Test, TestingModule } from '@nestjs/testing';
import { MessagesGateway } from './messages.gateway';
import { MessagesService } from './messages.service';

describe('MessagesController', () => {
	let controller: MessagesGateway;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [MessagesGateway],
			providers: [MessagesService]
		}).compile();

		controller = module.get<MessagesGateway>(MessagesGateway);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
