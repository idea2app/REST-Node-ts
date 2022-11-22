import { Constructor } from 'web-utility';
import {
    JsonController,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    OnUndefined,
    OnNull
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';
import { Repository } from 'typeorm';

import dataSource, { BaseModel, Base } from '../model';

export function Controller<M extends BaseModel, E extends Base>(
    rootPath: `/${string}`,
    Model: Constructor<M>,
    Entity: Constructor<E>
) {
    type Model = typeof Model;

    @JsonController(rootPath)
    abstract class BaseController {
        store = dataSource.getRepository(Entity);

        @Post()
        @ResponseSchema(Model)
        createOne(@Body() data: Model) {
            const entity = new Entity();

            return this.store.save(Object.assign(entity, data));
        }

        @Patch('/:id')
        @ResponseSchema(Model)
        async updateOne(@Param('id') id: number, @Body() data: Model) {
            const { raw } = await this.store.update(id, { ...data });

            return raw;
        }

        @Get('/:id')
        @OnNull(404)
        @ResponseSchema(Model)
        getOne(@Param('id') id: number) {
            return (this.store as Repository<Base>).findOne({ where: { id } });
        }

        @Delete('/:id')
        @OnUndefined(204)
        async deleteOne(@Param('id') id: number) {
            await this.store.delete(id);
        }

        @Get()
        async getList() {
            const [list, count] = await this.store.findAndCount();

            return { list, count };
        }
    }
    return BaseController;
}
