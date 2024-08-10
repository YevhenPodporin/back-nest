import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from '../appTest.factory';
import { UserWithProfileResponse } from '../../user/types';
import * as matchers from 'jest-extended';
import { RegisterTestUser, userToRegister } from '../helpers';
expect.extend(matchers);

describe('User controller (e2e)', () => {
	let app: INestApplication;
	let accessTokenFromResponse: string;
	let refreshTokenFromResponse: string;

	beforeAll(async () => {
		app = await createTestApp();
		await app.init();
	});

	it('/POST register user', async () => {
		const { refreshToken, accessToken } = await RegisterTestUser(app);
		accessTokenFromResponse = accessToken;
		refreshTokenFromResponse = refreshToken;
	});

	it('/GET profile', async () => {
		const response = await request(app.getHttpServer())
			.get('/api/user/profile')
			.set('Cookie', [accessTokenFromResponse, refreshTokenFromResponse]);

		expect(response.status).toBe(HttpStatus.OK);
		expect(response.body).toEqual(
			expect.objectContaining<Partial<UserWithProfileResponse['user']>>({
				id: expect.any(Number),
				user_id: expect.any(Number),
				email: userToRegister.email,
				first_name: userToRegister.first_name,
				last_name: userToRegister.last_name,
				date_of_birth: userToRegister.date_of_birth,
				file_path: expect.toBeOneOf([expect.any(String), null]),
				is_online: expect.any(Boolean),
				created_at: expect.any(String),
				updated_at: expect.any(String)
			})
		);
	});

	it('/GET profile without tokens', async () => {
		const response = await request(app.getHttpServer()).get(
			'/api/user/profile'
		);

		expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
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
