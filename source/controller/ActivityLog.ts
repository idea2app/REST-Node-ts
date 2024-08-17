import { Get, JsonController, QueryParams } from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import {
    ActivityLog,
    ActivityLogFilter,
    ActivityLogListChunk,
    BaseFilter,
    dataSource,
    Operation,
    User,
    UserRank,
    UserRankListChunk
} from '../model';

const store = dataSource.getRepository(ActivityLog),
    userStore = dataSource.getRepository(User),
    userRankStore = dataSource.getRepository(UserRank);

@JsonController('/activity-log')
export class ActivityLogController {
    static logCreate(
        createdBy: User,
        tableName: ActivityLog['tableName'],
        recordId: number
    ) {
        const operation = Operation.Create;

        return store.save({ createdBy, operation, tableName, recordId });
    }

    static logUpdate(
        createdBy: User,
        tableName: ActivityLog['tableName'],
        recordId: number
    ) {
        const operation = Operation.Update;

        return store.save({ createdBy, operation, tableName, recordId });
    }

    static logDelete(
        createdBy: User,
        tableName: ActivityLog['tableName'],
        recordId: number
    ) {
        const operation = Operation.Delete;

        return store.save({ createdBy, operation, tableName, recordId });
    }

    @Get('/user-rank')
    @ResponseSchema(UserRankListChunk)
    async getUserRankList(@QueryParams() { pageSize, pageIndex }: BaseFilter) {
        const skip = pageSize * (pageIndex - 1);

        const [list, count] = await userRankStore.findAndCount({
            order: { score: 'DESC' },
            skip,
            take: pageSize
        });
        for (let i = 0, item: UserRank; (item = list[i]); i++) {
            item.rank = skip + i + 1;
            item.user = await userStore.findOneBy({ id: item.userId });
        }
        return { list, count };
    }

    @Get()
    @ResponseSchema(ActivityLogListChunk)
    async getList({
        operation,
        tableName,
        recordId,
        pageSize,
        pageIndex
    }: ActivityLogFilter) {
        const [list, count] = await store.findAndCount({
            where: { operation, tableName, recordId },
            relations: ['createdBy'],
            skip: pageSize * (pageIndex - 1),
            take: pageSize
        });

        for (const activity of list)
            activity.record = await dataSource
                .getRepository<ActivityLog['record']>(activity.tableName)
                .findOneBy({ id: activity.recordId });

        return { list, count };
    }
}
