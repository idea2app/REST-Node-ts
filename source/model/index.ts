import { DataSource, DataSourceOptions } from 'typeorm';

import { isProduct } from '../utility';
import { ActivityLog } from './ActivityLog';
import { User } from './User';
import { UserCredential } from './WebAuthn';

export * from './ActivityLog';
export * from './Base';
export * from './File';
export * from './OAuth';
export * from './User';
export * from './WebAuthn';

const {
    DATABASE_TYPE: type,
    DATABASE_SSL: ssl,
    DATABASE_HOST: host,
    DATABASE_PORT: port,
    DATABASE_USER: user,
    DATABASE_PASSWORD: password,
    DATABASE_NAME: database
} = isProduct ? process.env : {};

const entities = [User, UserCredential, ActivityLog];

const commonOptions: Pick<
    Extract<DataSourceOptions, { type: 'better-sqlite3' }>,
    'logging' | 'synchronize' | 'entities' | 'migrations'
> = {
    logging: true,
    synchronize: true,
    entities,
    migrations: [`${isProduct ? '.data' : 'migration'}/*.ts`]
};

export const dataSource = isProduct
    ? new DataSource({
          type: type as 'postgres',
          ssl: ssl === 'true',
          host,
          port: Number(port ?? 5432),
          username: user,
          password,
          database,
          ...commonOptions
      })
    : new DataSource({
          type: 'better-sqlite3',
          database: '.data/test.db',
          ...commonOptions
      });
