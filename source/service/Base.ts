import { NotFoundError } from 'routing-controllers';
import { FindManyOptions, FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { Constructor } from 'web-utility';

import { Base, BaseFilter, dataSource, InputData, ListChunk } from '../model';
import { cleanEmptyFields, searchConditionOf } from '../utility';

export class BaseService<T extends Base> {
    store: Repository<T>;
    tableName: string;

    constructor(
        public entityClass: Constructor<T>,
        public searchKeys: (keyof T)[] = []
    ) {
        this.store = dataSource.getRepository(entityClass);
        this.tableName = entityClass.name;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createOne(data: Partial<T>, ...rest: any[]) {
        return this.store.save(cleanEmptyFields(data) as T);
    }

    getOne(id: number, relations?: string[]) {
        return this.store.findOne({ where: { id } as FindOptionsWhere<T>, relations });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async editOne(id: number, data: Partial<T>, ...rest: any[]) {
        const { store, tableName } = this;

        const existed = await this.store.findOneBy({ id } as FindOptionsWhere<T>);

        if (!existed) throw new NotFoundError(`${tableName} ${id} is not found`);

        return store.save({ ...existed, ...cleanEmptyFields(data), id } as T);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    deleteOne(id: number, ...rest: any[]) {
        return this.store.delete(id);
    }

    async getList(
        {
            keywords,
            pageSize = 10,
            pageIndex = 1,
            ...filter
        }: Partial<InputData<T>> & BaseFilter = {},
        where?: FindOneOptions<T>['where'],
        options = { order: { updatedAt: 'DESC' } } as FindManyOptions<T>
    ) {
        where ??= searchConditionOf<T>(
            this.searchKeys,
            keywords,
            cleanEmptyFields(filter as Partial<InputData<{}>>)
        );
        const [list, count] = await this.store.findAndCount({
            ...options,
            where,
            skip: pageSize * (pageIndex - 1),
            take: pageSize
        });
        return { list, count } as ListChunk<T>;
    }
}
