import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Tokens } from '../auth/types';
import { UserRegisterDto } from '../auth/dto/user-register.dto';
import { faker } from '@faker-js/faker';

export const userToRegister: UserRegisterDto = {
	date_of_birth: '1995-01-18',
	password: '123',
	email: faker.internet.email(),
	first_name: faker.person.firstName(),
	last_name: faker.person.lastName()
};

export const RegisterTestUser = async (
	app: INestApplication
): Promise<Tokens & { response: any }> => {
	const response = await request(app.getHttpServer())
		.post('/api/auth/register')
		.send(userToRegister);
	const [accessToken, refreshToken] = response.headers['set-cookie'];

	return { accessToken, refreshToken, response };
};
