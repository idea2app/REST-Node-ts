import { Controller, Get, HeaderParam, HttpCode } from 'routing-controllers';

import { isProduct } from '../utility';

@Controller()
export class BaseController {
    static entryOf(host: string) {
        host = 'http://' + host;

        return `
- HTTP served at ${host}
- Swagger API served at ${host}/docs/
- Swagger API exposed at ${host}/docs/spec
${isProduct ? '' : `- Mock API served at ${host}/mock/`}
`;
    }

    @Get('/_health')
    @HttpCode(200)
    getHealthStatus() {
        return '';
    }

    @Get('/')
    async getIndex(@HeaderParam('host') host: string) {
        const { marked } = await import('marked');

        return marked(BaseController.entryOf(host));
    }
}
