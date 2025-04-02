import type {} from 'koa2-swagger-ui';
import { createAPI } from 'koagger';

import { isProduct } from '../utility';
import { ActivityLogController } from './ActivityLog';
import { BaseController } from './Base';
import { FileController } from './File';
import { OauthController } from './OAuth';
import { UserController } from './User';
import { WebAuthnController } from './WebAuthn';

export * from './ActivityLog';
export * from './Base';
export * from './File';
export * from './OAuth';
export * from './User';
export * from './WebAuthn';

export const controllers = [
    WebAuthnController,
    OauthController,
    UserController,
    ActivityLogController,
    FileController,
    BaseController
];
export const { swagger, mocker, router } = createAPI({
    mock: !isProduct,
    controllers
});
