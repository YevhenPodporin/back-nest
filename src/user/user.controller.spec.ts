import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { applyMigration, startContainer } from '../database/db-container';
import * as path from 'path';

describe('UserController', () => {
	let controller: UserController;

	beforeAll(async () => {
		const { container, connection } = await startContainer();
		await applyMigration(
			connection,
			path.resolve(
				__dirname,
				'dist/src/database/migrations/1721045034979-MyNewMigration.js'
			)
		);
	});

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [UserController],
			providers: [UserService]
		}).compile();

		controller = module.get<UserController>(UserController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
