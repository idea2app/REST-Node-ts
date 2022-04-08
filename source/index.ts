import 'reflect-metadata';
import 'dotenv/config';

import Koa from 'koa';
import KoaLogger from 'koa-logger';
import jwt from 'koa-jwt';
import { useKoaServer } from 'routing-controllers';

import { swagger, mocker, router, UserController } from './controller';
import dataSource, { isProduct } from './model';

const { PORT = 8080, APP_SECRET } = process.env;

const HOST = `http://localhost:${PORT}`,
    app = new Koa()
        .use(KoaLogger())
        .use(swagger())
        .use(jwt({ secret: APP_SECRET, passthrough: true }));

if (!isProduct) app.use(mocker());

useKoaServer(app, {
    ...router,
    cors: true,
    authorizationChecker: action => !!UserController.getSession(action),
    currentUserChecker: UserController.getSession
});

console.time('Server boot');

dataSource.initialize().then(() =>
    app.listen(PORT, () => {
        console.log(`
HTTP served at ${HOST}
Swagger API served at ${HOST}/docs/`);

        if (!isProduct) console.log('Mock API served at ${HOST}/mock/\n');

        console.timeEnd('Server boot');
    })
);
