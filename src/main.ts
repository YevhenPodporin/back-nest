import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { GlobalFilter } from './global/global.filter';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
	const app = await NestFactory.create<NestApplication>(AppModule, {
		bodyParser: true
	});

	await app.startAllMicroservices();
	dotenv.config();
	app.setGlobalPrefix('api');
	app.use(cookieParser());
	app.enableCors({ origin: 'http://localhost:3000', credentials: true });
	app.useGlobalPipes(new ValidationPipe({ transform: true }));
	app.useStaticAssets(join(__dirname, '..', 'public'));
	app.useGlobalFilters(new GlobalFilter());

	const config = new DocumentBuilder()
		.setTitle('Chat app')
		.setDescription('Nest api for chat application')
		.setVersion('1.0')
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api/swagger', app, document);
	await app.listen(process.env.PORT || 4000);
	console.log('...Listening port:' + process.env.PORT || 4000);
}

bootstrap();
