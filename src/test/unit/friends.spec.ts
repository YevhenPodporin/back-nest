import { HttpStatus, INestApplication } from '@nestjs/common';
import { createTestApp } from '../appTest.factory';
import { RegisterTestUser } from '../helpers';
import { Tokens } from '../../auth/types';
import * as request from 'supertest';
import { Direction, OrderBy } from '../../messages/types';
import { FriendsRequestDto } from '../../friends/dto/friends-request.dto';
import { RequestStatus } from '../../friends/friends.entity';

describe('Friends controller (e2e)', () => {
	let app: INestApplication;
	const users: { tokens: Tokens; id: number }[] = []; // Инициализируем массив
	const pagination = {
		take: 10,
		skip: 0,
		direction: Direction.asc,
		order_by: OrderBy.created_at
	};

	beforeAll(async () => {
		app = await createTestApp();
		await app.init();
	});

	it('/POST register user', async () => {
		const registeredUsers = await Promise.all([
			RegisterTestUser(app),
			RegisterTestUser(app)
		]);

		registeredUsers.forEach(user => {
			users.push({
				id: user.response.body.user.user_id,
				tokens: {
					accessToken: user.accessToken,
					refreshToken: user.refreshToken
				}
			});
		});
	});

	it('/GET all users (exclude me)', async () => {
		const queryParams = {
			pagination: {
				take: 10,
				skip: 0,
				direction: Direction.asc,
				order_by: OrderBy.created_at
			}
		};

		const requests = () =>
			users.map(user => {
				return request(app.getHttpServer())
					.get('/api/network/get_users')
					.query(queryParams)
					.set('Cookie', [user.tokens.accessToken, user.tokens.refreshToken]);
			});

		const responses = await Promise.all(requests());

		responses.forEach((resp, index) => {
			expect(resp.body.count).toBeNumber();
			expect(resp.body.list).toBeArray();
			expect(resp.body.list.length).not.toEqual(0);
			expect(resp.body.list).not.toEqual(
				expect.objectContaining({
					user_id: users[index].id
				})
			);
		});
	});

	it('/POST request to friend', async () => {
		const queryParams = {
			pagination,
			filter: {
				status: RequestStatus.REQUEST
			}
		};
		const queryParamsToRequest: FriendsRequestDto = {
			status: RequestStatus.REQUEST,
			to_user_id: users[1].id
		};

		const response = await request(app.getHttpServer())
			.post('/api/network/request')
			.send(queryParamsToRequest)
			.set('Cookie', [
				users[0].tokens.accessToken,
				users[0].tokens.refreshToken
			]);
		expect(response.status).toEqual(HttpStatus.CREATED);
		expect(response.body).toEqual(
			expect.objectContaining({
				status: RequestStatus.REQUEST,
				from_user: { id: users[0].id },
				to_user: { id: users[1].id }
			})
		);

		const requestsList = await request(app.getHttpServer())
			.get('/api/network/get_users')
			.query(queryParams)
			.set('Cookie', [
				users[1].tokens.accessToken,
				users[1].tokens.refreshToken
			]);

		expect(requestsList.body.count).toBeNumber();
		expect(requestsList.body.list).toBeArray();
		expect(requestsList.body.list.length).not.toEqual(0);
		expect(
			requestsList.body.list.find(user => user.user_id === users[0].id)
		).toBeTruthy();
	});

	it('/POST approve request to friend', async () => {
		const queryParamsToRequest: FriendsRequestDto = {
			status: RequestStatus.APPROVED,
			to_user_id: users[0].id
		};

		const response = await request(app.getHttpServer())
			.post('/api/network/request')
			.send(queryParamsToRequest)
			.set('Cookie', [
				users[1].tokens.accessToken,
				users[1].tokens.refreshToken
			]);
		expect(response.status).toEqual(HttpStatus.CREATED);
		expect(response.body).toEqual(
			expect.objectContaining({
				status: RequestStatus.APPROVED
			})
		);
	});

	it('/POST remove from friend', async () => {
		const queryParamsToRequest: FriendsRequestDto = {
			status: RequestStatus.REJECTED,
			to_user_id: users[1].id
		};

		const response = await request(app.getHttpServer())
			.post('/api/network/request')
			.send(queryParamsToRequest)
			.set('Cookie', [
				users[0].tokens.accessToken,
				users[0].tokens.refreshToken
			]);

		expect(response.status).toEqual(HttpStatus.CREATED);
		expect(response.body).toEqual(
			expect.objectContaining({
				status: RequestStatus.APPROVED
			})
		);
	});

	afterAll(async () => {
		for (let i = 0; i < users.length; i++) {
			const response = await request(app.getHttpServer())
				.delete('/api/user')
				.set('Cookie', [
					users[i].tokens.accessToken,
					users[i].tokens.refreshToken
				]);

			expect(response.status).toBe(HttpStatus.OK);
		}
		await app.close();
	});
});
