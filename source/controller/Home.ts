import { JsonController, Get } from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import { Home } from '../model/Home';

@JsonController('/')
export class HomeController {
    @Get()
    @ResponseSchema(Home)
    getEntry() {
        const createdAt = new Date().toJSON();

        return {
            id: 1,
            createdAt,
            updatedAt: createdAt,
            content: 'Hello, REST-Node-ts!'
        };
    }
}
