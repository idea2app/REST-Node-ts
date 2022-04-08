import { createAPI } from 'koagger';

import { isProduct } from '../model';
import { HomeController } from './Home';
import { UserController } from './User';

export * from './Home';
export * from './User';

export const { swagger, mocker, router } = createAPI({
    mock: !isProduct,
    controllers: [UserController, HomeController]
});
