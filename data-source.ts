import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';
import { FileEntity } from './src/files/file.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: String(process.env.DB_PASSWORD || ''),
  database: process.env.DB_NAME,
  entities: [FileEntity],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: false,
});
