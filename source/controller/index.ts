import type {} from 'koa2-swagger-ui';
import { createAPI } from 'koagger';

import { isProduct } from '../utility';
import { BaseController } from './Base';
import { UserController } from './User';
import { OauthController } from './OAuth';
import { ActivityLogController } from './ActivityLog';

export * from './Base';
export * from './User';
export * from './OAuth';
export * from './ActivityLog';

export const { swagger, mocker, router } = createAPI({
    mock: !isProduct,
    controllers: [
        OauthController,
        UserController,
        ActivityLogController,
        BaseController
    ]
});
