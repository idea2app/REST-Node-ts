import { ForbiddenError, NotFoundError } from 'routing-controllers';
import { FindManyOptions, FindOneOptions, FindOptionsWhere } from 'typeorm';

import { ActivityLog, BaseFilter, InputData, Role, User, UserBase, UserBaseFilter } from '../model';
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

    async validateAccess(
        id: number,
        { id: uid, roles }: User,
        allowedRoles: Role[] = [Role.Manager, Role.Administrator]
    ) {
        const { tableName } = this,
            oldOne = await this.getOne(id);

        if (!oldOne) throw new NotFoundError(`${tableName} with ID "${id}" is not found`);

        if (oldOne.createdBy?.id !== uid && !roles.some(role => allowedRoles.includes(role)))
            throw new ForbiddenError(
                `Only creator or some roles can access ${tableName} with ID "${id}"`
            );
        return oldOne;
    }

    async editOne(id: number, data: Partial<T>, updatedBy: User) {
        await this.validateAccess(id, updatedBy);

        return super.editOne(id, { ...data, updatedBy });
    }

    async deleteOne(id: number, deletedBy: User) {
        const { store } = this;

        await this.validateAccess(id, deletedBy, [Role.Administrator]);

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

        return super.getList(
            { keywords, ...filter } as Partial<InputData<T>> & BaseFilter,
            where,
            options
        );
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
