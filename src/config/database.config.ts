import { registerAs } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

export const dataSourceOptions = (): DataSourceOptions => ({
	type: 'mysql',
	host: process.env.DATABASE_HOST,
	port: Number(process.env.DATABASE_PORT),
	username: process.env.DATABASE_USERNAME,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE_NAME,
	synchronize: false,
	migrations: ['dist/src/database/migrations/*'],
	entities: [`${__dirname}/../**/*.entity.{ts,js}`],
	migrationsRun: true,
	logging: false
});

export default registerAs<DataSourceOptions>('database', () => ({
	...dataSourceOptions(),
	autoLoadEntities: true
}));
