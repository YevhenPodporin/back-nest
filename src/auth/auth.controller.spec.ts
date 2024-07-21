import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthModule } from './auth.module';
import { faker } from '@faker-js/faker';

import { UserService } from '../user/user.service';
import { INestApplication } from '@nestjs/common';
import { User } from '../user/user.entity';
import { Profile } from '../profile/profile.entity';
import { UserRegisterDto } from './dto/user-register.dto';

describe('AuthController', () => {
	let controller: AuthController;
	let userService: UserService;
	let app: INestApplication;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [AuthModule]
		}).compile();

		userService = module.get<UserService>(UserService);
		controller = module.get<AuthController>(AuthController);
		app = module.createNestApplication();
		await app.init();
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	it('should register user', async () => {
		const dataToRegisterUser: UserRegisterDto = {
			date_of_birth: '1995-18-01',
			password: '123',
			email: faker.internet.email(),
			first_name: faker.person.firstName(),
			last_name: faker.person.lastName()
		};
		// Вызываем метод регистрации на контроллере
		// request(app).post('auth/register');
		const registeredUser = await controller.register(null, dataToRegisterUser);
		// Ожидаем, что зарегистрированный пользователь существует
		expect(registeredUser).toBeDefined();
		// Ожидаем, что зарегистрированный пользователь содержит поля, которые мы ожидаем
		expect(registeredUser.user).toMatchObject<Partial<User | Profile>>({
			email: dataToRegisterUser.email,
			first_name: dataToRegisterUser.first_name,
			last_name: dataToRegisterUser.last_name
		});
		// Ожидаем, что токены доступа и обновления были успешно созданы
		expect(registeredUser.accessToken).toBeDefined();
		expect(registeredUser.refreshToken).toBeDefined();

		const deletedUser = await userService.deleteUser(
			registeredUser.user.user_id
		);

		// expect(deletedUser.id).toEqual(registeredUser.user.id);
	});
});
