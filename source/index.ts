import 'reflect-metadata';
import Koa from 'koa';
import KoaLogger from 'koa-logger';
import cors from '@koa/cors';
import { useKoaServer } from 'routing-controllers';

import { swagger, mocker, router } from './controller';
import dataSource from './model';

const { PORT = 8080 } = process.env;

const HOST = `http://localhost:${PORT}`,
    app = new Koa().use(KoaLogger()).use(cors()).use(swagger()).use(mocker());

useKoaServer(app, router);

console.time('Server boot');

dataSource.initialize().then(() =>
    app.listen(PORT, () => {
        console.log(`
HTTP served at ${HOST}
Swagger API served at ${HOST}/docs/
Mock API served at ${HOST}/mock/
`);
        console.timeEnd('Server boot');
    })
);
