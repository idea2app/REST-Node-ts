import { Get, JsonController, Param, QueryParams } from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';
import { FindOptionsWhere } from 'typeorm';

import {
    ActivityLog,
    ActivityLogFilter,
    ActivityLogListChunk,
    Base,
    BaseFilter,
    dataSource,
    LogableTable,
    User,
    UserRank,
    UserRankListChunk
} from '../model';

const store = dataSource.getRepository(ActivityLog),
    userStore = dataSource.getRepository(User),
    userRankStore = dataSource.getRepository(UserRank);

@JsonController('/activity-log')
export class ActivityLogController {
    @Get('/user-rank')
    @ResponseSchema(UserRankListChunk)
    async getUserRankList(@QueryParams() { pageSize = 10, pageIndex = 1 }: BaseFilter) {
        const skip = pageSize * (pageIndex - 1);

        const [list, count] = await userRankStore.findAndCount({
            order: { score: 'DESC' },
            skip,
            take: pageSize
        });
        for (let i = 0, item: UserRank; (item = list[i]); i++) {
            item.rank = skip + i + 1;
            item.user = (await userStore.findOneBy({ id: item.userId }))!;
        }
        return { list, count };
    }

    @Get('/user/:id')
    @ResponseSchema(ActivityLogListChunk)
    getUserList(
        @Param('id') id: number,
        @QueryParams() { operation, pageSize = 10, pageIndex = 1 }: ActivityLogFilter
    ) {
        return this.queryList(
            { ...(operation && { operation }), createdBy: { id } },
            { pageSize, pageIndex }
        );
    }

    @Get('/:table/:id')
    @ResponseSchema(ActivityLogListChunk)
    getList(
        @Param('table') tableName: keyof typeof LogableTable,
        @Param('id') recordId: number,
        @QueryParams() { operation, pageSize = 10, pageIndex = 1 }: ActivityLogFilter
    ) {
        return this.queryList(
            { ...(operation && { operation }), tableName, recordId },
            { pageSize, pageIndex }
        );
    }

    async queryList(
        where: FindOptionsWhere<ActivityLog>,
        { pageSize = 10, pageIndex = 1 }: BaseFilter
    ) {
        const [list, count] = await store.findAndCount({
            where,
            relations: { createdBy: true },
            skip: pageSize * (pageIndex - 1),
            take: pageSize
        });

        for (const activity of list)
            activity.record =
                (await dataSource
                    .getRepository<Base>(activity.tableName)
                    .findOneBy({ id: activity.recordId })) ?? undefined;

        return { list, count };
    }
}
