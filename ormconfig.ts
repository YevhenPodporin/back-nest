import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config(); // Load .env file contents into process.env

const configService = new ConfigService();

export default new DataSource({
	type: 'mysql',
	host: configService.get('DATABASE_HOST'),
	port: parseInt(configService.get('DATABASE_PORT'), 10),
	username: configService.get('DATABASE_USERNAME'),
	password: configService.get('DATABASE_PASSWORD'),
	database: configService.get('DATABASE_NAME'),
	entities: ['dist/**/*.entity{.ts,.js}'],
	migrations: ['dist/src/database/migrations/*.js'],
	synchronize: false,
	migrationsRun: false
});
