import type {} from 'koa2-swagger-ui';
import { createAPI } from 'koagger';

import { UserController } from './User';
import { isProduct } from '../utility';

export * from './User';

export const { swagger, mocker, router } = createAPI({
    mock: !isProduct,
    controllers: [UserController]
});
