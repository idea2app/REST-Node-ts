import { DataSource } from 'typeorm';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';
import { ConnectionOptions, parse } from 'pg-connection-string';

import { Home } from './Home';

export * from './Base';
export * from './Home';

const { NODE_ENV, DATABASE_URL } = process.env;

const isProduct = NODE_ENV === 'production';

const { host, port, user, password } = isProduct
    ? parse(DATABASE_URL)
    : ({} as ConnectionOptions);

const commonOptions: Pick<
    SqliteConnectionOptions,
    'synchronize' | 'entities' | 'migrations'
> = {
    synchronize: true,
    entities: [Home],
    migrations: ['.data/*.ts']
};

export default isProduct
    ? new DataSource({
          type: 'postgres',
          host,
          port: +port,
          username: user,
          password,
          logging: true,
          ...commonOptions
      })
    : new DataSource({
          type: 'sqlite',
          database: '.data/test.db',
          logging: false,
          ...commonOptions
      });
