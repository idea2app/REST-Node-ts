import { createAPI } from 'koagger';

import { HomeController } from './Home';

export const { swagger, mocker, router } = createAPI({
    mock: true,
    controllers: [HomeController]
});
