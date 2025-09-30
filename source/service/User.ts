import { ForbiddenError, NotFoundError } from 'routing-controllers';
import { FindManyOptions, FindOneOptions, FindOptionsWhere } from 'typeorm';

import { ActivityLog,Role, User, UserBase, UserBaseFilter } from '../model';
import { searchConditionOf } from '../utility';
import { activityLogService } from './ActivityLog';
import { BaseService } from './Base';

export class UserService<T extends UserBase> extends BaseService<T> {
    createOne(data: Partial<T>, createdBy: User) {
        return super.createOne({ ...data, createdBy });
    }

    getOne(id: number, relations: string[] = ['createdBy', 'updatedBy']) {
        return super.getOne(id, relations);
    }

    async editOne(id: number, data: Partial<T>, updatedBy: User) {
        const { tableName } = this;

        const oldOne = await this.getOne(id);

        if (!oldOne) throw new NotFoundError(`${tableName} ${id} is not found`);

        if (
            oldOne.createdBy?.id !== updatedBy.id &&
            !updatedBy.roles.includes(Role.Administrator) &&
            !updatedBy.roles.includes(Role.Manager)
        )
            throw new ForbiddenError(`Only creator or staff can edit ${tableName} ${id}`);

        return super.editOne(id, { ...data, updatedBy });
    }

    async deleteOne(id: number, deletedBy: User) {
        const { store, tableName } = this;

        const oldOne = await store.findOne({
            where: { id } as FindOptionsWhere<T>,
            relations: ['createdBy']
        });

        if (!oldOne) throw new NotFoundError(`${tableName} ${id} is not found`);

        if (oldOne.createdBy?.id !== deletedBy.id && !deletedBy.roles.includes(Role.Administrator))
            throw new ForbiddenError(`Only creator or admin can delete ${tableName} ${id}`);

        await store.save({ id, deletedBy } as T);
        return store.softDelete(id);
    }

    getList(
        { createdBy, updatedBy, keywords, ...filter }: UserBaseFilter,
        where?: FindOneOptions<T>['where'],
        options: FindManyOptions<T> = { relations: ['createdBy'] }
    ) {
        where ??= searchConditionOf<T>(this.searchKeys, keywords, {
            ...(createdBy ? { createdBy: { id: createdBy } } : {}),
            ...(updatedBy ? { updatedBy: { id: updatedBy } } : {})
        } as FindOptionsWhere<T>);

        return super.getList({ keywords, ...filter }, where, options);
    }
}

export class UserServiceWithLog<T extends UserBase> extends UserService<T> {
    declare tableName: ActivityLog['tableName'];

    async createOne(data: Partial<T>, createdBy: User) {
        const createdOne = await super.createOne(data, createdBy);

        await activityLogService.logCreate(createdBy, this.tableName, createdOne.id);

        return createdOne;
    }

    async editOne(id: number, data: Partial<T>, updatedBy: User) {
        const updatedOne = await super.editOne(id, data, updatedBy);

        await activityLogService.logUpdate(updatedBy, this.tableName, id);

        return updatedOne;
    }

    async deleteOne(id: number, deletedBy: User) {
        const result = await super.deleteOne(id, deletedBy);

        await activityLogService.logDelete(deletedBy, this.tableName, id);

        return result;
    }
}
