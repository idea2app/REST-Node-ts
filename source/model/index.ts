import { DataSource } from 'typeorm';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';

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
    SqliteConnectionOptions,
    'logging' | 'synchronize' | 'entities' | 'invalidWhereValuesBehavior' | 'migrations'
> = {
    logging: true,
    synchronize: true,
    entities,
    // remove at next Major version: https://typeorm.io/docs/data-source/null-and-undefined-handling/#default-behavior
    invalidWhereValuesBehavior: { null: 'throw', undefined: 'throw' },
    migrations: [`${isProduct ? '.data' : 'migration'}/*.ts`]
};

export const dataSource = isProduct
    ? new DataSource({
          type: type as 'postgres',
          ssl: ssl === 'true',
          host,
          port: +port,
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
