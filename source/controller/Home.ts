import { JsonController, Get, Post, Body } from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import dataSource, { HomeModel, Home } from '../model';

@JsonController('/')
export class HomeController {
    store = dataSource.getRepository(Home);

    @Get()
    @ResponseSchema(HomeModel, { isArray: true })
    getList() {
        return this.store.find();
    }

    @Post()
    @ResponseSchema(HomeModel)
    createOne(@Body() data: HomeModel) {
        return this.store.save(Object.assign(new Home(), data));
    }
}
