import { ConnectionOptions, parse } from 'pg-connection-string';
import { DataSource } from 'typeorm';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';

import { DATABASE_URL, isProduct } from '../utility';
import { User } from './User';

export * from './Base';
export * from './User';

const { ssl, host, port, user, password, database } = isProduct
    ? parse(DATABASE_URL)
    : ({} as ConnectionOptions);

const commonOptions: Pick<
    SqliteConnectionOptions,
    'logging' | 'synchronize' | 'entities' | 'migrations'
> = {
    logging: true,
    synchronize: true,
    entities: [User],
    migrations: [`${isProduct ? '.data' : 'migration'}/*.ts`]
};

export const dataSource = isProduct
    ? new DataSource({
          type: 'postgres',
          ssl: ssl as boolean,
          host,
          port: +port,
          username: user,
          password,
          database,
          ...commonOptions
      })
    : new DataSource({
          type: 'sqlite',
          database: '.data/test.db',
          ...commonOptions
      });
