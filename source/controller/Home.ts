import { JsonController, Get, Post, Body } from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import dataSource, { HomeModel, Home } from '../model';

@JsonController('/')
export class HomeController {
    @Get()
    @ResponseSchema(HomeModel, { isArray: true })
    getList() {
        return dataSource.getRepository(Home).find();
    }

    @Post()
    @ResponseSchema(HomeModel)
    createOne(@Body() data: HomeModel) {
        return dataSource
            .getRepository(Home)
            .save(Object.assign(new Home(), data));
    }
}
