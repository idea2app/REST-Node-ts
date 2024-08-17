import { marked } from 'marked';
import {
    Get,
    HeaderParam,
    HttpCode,
    JsonController
} from 'routing-controllers';

import { isProduct } from '../utility';

@JsonController()
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

    @Get()
    getIndex(@HeaderParam('host') host: string) {
        return `<pre>${marked(BaseController.entryOf(host))}</pre>`;
    }
}
