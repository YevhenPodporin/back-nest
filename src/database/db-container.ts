import { GenericContainer } from 'testcontainers';
import mysql from 'mysql2/promise';

export async function startContainer() {
	let container;
	try {
		container = await new GenericContainer('mysql')
			.withEnvironment({ DATABASE_PASSWORD: '1995' })
			.withExposedPorts(3306)
			.start();
	} catch (e) {
		console.log(e);
	}

	const connection = await mysql.createConnection({
		host: container.getHost(),
		port: container.getMappedPort(3306),
		user: 'root',
		password: 'root'
	});

	return { container, connection };
}

export async function applyMigration(connection, migrationFilePath) {
	const migration = require(migrationFilePath);
	await migration.up(connection);
}
