import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { dataSourceOptions } = require('./config/database.config');

export const connectionSource = new DataSource(dataSourceOptions());
