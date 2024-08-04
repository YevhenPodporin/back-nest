import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import * as cookieParser from 'cookie-parser';

export async function createTestApp(): Promise<INestApplication> {
	const moduleFixture: TestingModule = await Test.createTestingModule({
		imports: [AppModule]
	}).compile();

	const app = moduleFixture
		.createNestApplication()
		.setGlobalPrefix('api')
		.use(cookieParser());
	app.useGlobalPipes(new ValidationPipe({ transform: true }));

	return app;
}
