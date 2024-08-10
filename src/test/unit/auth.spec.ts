import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from '../appTest.factory';
import { UserRegisterDto } from '../../auth/dto/user-register.dto';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../../constants';
import { RegisterTestUser, userToRegister } from '../helpers';

describe('Auth controller (e2e)', () => {
	let app: INestApplication;
	// let dataSource: DataSource;
	let accessTokenFromResponse: string;
	let refreshTokenFromResponse: string;

	const extractValue = (token: string) => {
		return token.split('=')[1].split(';')[0];
	};

	beforeAll(async () => {
		app = await createTestApp();
		await app.init();

		// dataSource = app.get(DataSource);
	});

	it('/POST register user', async () => {
		const { response, refreshToken, accessToken } = await RegisterTestUser(app);

		expect(response.status).toBe(HttpStatus.CREATED);
		expect(response.body.user).toEqual(
			expect.objectContaining<Partial<UserRegisterDto>>({
				email: userToRegister.email,
				first_name: userToRegister.first_name,
				last_name: userToRegister.last_name
			})
		);
		expect(accessToken).toMatch(ACCESS_TOKEN);
		expect(refreshToken).toMatch(REFRESH_TOKEN);
	});

	it('/POST login user', async () => {
		const response = await request(app.getHttpServer())
			.post('/api/auth/login')
			.send({
				email: userToRegister.email,
				password: userToRegister.password
			});
		const [accessToken, refreshToken] = response.headers['set-cookie'];
		accessTokenFromResponse = accessToken;
		refreshTokenFromResponse = refreshToken;

		expect(response.body.user).toEqual(
			expect.objectContaining<Partial<UserRegisterDto>>({
				email: userToRegister.email,
				first_name: userToRegister.first_name,
				last_name: userToRegister.last_name
			})
		);
		expect(accessToken).toMatch(ACCESS_TOKEN);
		expect(refreshToken).toMatch(REFRESH_TOKEN);
	});

	it('/POST issue tokens', async () => {
		const response = await request(app.getHttpServer())
			.post('/api/auth/access-token')
			.set('Cookie', [refreshTokenFromResponse]);
		const [accessToken, refreshToken] = response.headers['set-cookie'];

		expect(accessToken).toMatch(ACCESS_TOKEN);
		expect(refreshToken).toMatch(REFRESH_TOKEN);
		expect(extractValue(accessToken)).not.toEqual(
			extractValue(accessTokenFromResponse)
		);
		expect(extractValue(refreshToken)).not.toEqual(
			extractValue(refreshTokenFromResponse)
		);
	});

	it('/POST sign out', async () => {
		const response = await request(app.getHttpServer())
			.post('/api/auth/sign-out')
			.set('Cookie', [accessTokenFromResponse, refreshTokenFromResponse]);
		const [accessToken, refreshToken] = response.headers['set-cookie'];

		expect(extractValue(accessToken)).toBeFalsy();
		expect(extractValue(refreshToken)).toBeFalsy();
	});

	it('/POST delete user', async () => {
		const response = await request(app.getHttpServer())
			.delete('/api/user')
			.set('Cookie', [accessTokenFromResponse, refreshTokenFromResponse]);

		expect(response.status).toBe(HttpStatus.OK);
	});

	afterAll(() => {
		app.close();
	});
});

// TODO проерить с фронта друзей (добавление удаление список)
//  оставшиеся тесты написать по текущему примеру
//  Swagger - описать все виды request response обьектов для всех запросов
//  Docker
