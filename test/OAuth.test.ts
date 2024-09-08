import {
    ActivityLogListChunk,
    Operation,
    User,
    UserListChunk
} from '../source/model';
import { client, GITHUB_PAT } from './shared';

describe('OAuth controller', () => {
    it('should sign up a new User with a GitHub token', async () => {
        const { body: oldList } = await client.get<UserListChunk>('user');

        expect(oldList).toEqual({ count: 0, list: [] });

        const { body: session } = await client.post<User>('user/OAuth/GitHub', {
            accessToken: GITHUB_PAT
        });
        expect(session).toMatchObject({
            id: expect.any(Number),
            email: expect.any(String),
            name: expect.any(String),
            avatar: expect.any(String),
            password: null,
            token: expect.any(String),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date)
        });

        const { deletedAt, password, token, ...user } = session,
            { body: newList } = await client.get<UserListChunk>('user');

        expect(newList).toEqual({ count: 1, list: [user] });
    });

    it('should sign in an existed User with a GitHub token', async () => {
        const { body: list } = await client.get<UserListChunk>('user');

        expect(list).toEqual({ count: 1, list: expect.any(Array) });

        const { body: session } = await client.post<User>('user/OAuth/GitHub', {
            accessToken: GITHUB_PAT
        });
        const { password, token, ...user } = session;

        expect(user).toMatchObject(list.list[0]);
    });

    it('should record 2 activities of a new OAuth User', async () => {
        const { body } = await client.get<ActivityLogListChunk>(
            'activity-log/user/1'
        );
        expect(body).toEqual({
            count: 2,
            list: [
                {
                    id: expect.any(Number),
                    operation: Operation.Create,
                    tableName: 'User',
                    recordId: 1,
                    record: expect.any(Object),
                    createdAt: expect.any(Date),
                    createdBy: expect.any(Object),
                    updatedAt: expect.any(Date)
                },
                {
                    id: expect.any(Number),
                    operation: Operation.Update,
                    tableName: 'User',
                    recordId: 1,
                    record: expect.any(Object),
                    createdAt: expect.any(Date),
                    createdBy: expect.any(Object),
                    updatedAt: expect.any(Date)
                }
            ]
        });
    });
});
