import 'reflect-metadata';
import Koa from 'koa';
import KoaLogger from 'koa-logger';
import cors from '@koa/cors';
import { useKoaServer } from 'routing-controllers';

import { swagger, mocker, router } from './controller';

const { PORT = 8080 } = process.env;

const HOST = `http://localhost:${PORT}`,
    app = new Koa().use(KoaLogger()).use(cors()).use(swagger()).use(mocker());

useKoaServer(app, router);

console.time('HTTP boot');

app.listen(PORT, () => {
    console.log(`
HTTP served at ${HOST}
Swagger API served at ${HOST}/docs/
Mock API served at ${HOST}/mock/
`);
    console.timeEnd('HTTP boot');
});
