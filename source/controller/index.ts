import type {} from 'koa2-swagger-ui';
import { createAPI } from 'koagger';

import { isProduct } from '../utility';
import { BaseController } from './Base';
import { UserController } from './User';
import { ActivityLogController } from './ActivityLog';

export * from './Base';
export * from './User';
export * from './ActivityLog';

export const { swagger, mocker, router } = createAPI({
    mock: !isProduct,
    controllers: [UserController, ActivityLogController, BaseController]
});
