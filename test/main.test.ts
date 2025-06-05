import { Operation } from '../source/model';
import { HttpResponse, User } from './client';
import { client } from './shared';

let platformAdmin: User, commonUser: User;

const expectedBase = {
    id: expect.any(Number),
    createdAt: expect.any(String),
    updatedAt: expect.any(String)
};

describe('Main business logic', () => {
    it('should response 401 error with invalid token', async () => {
        try {
            await client.user.userControllerGetSession();
        } catch (error) {
            expect((error as HttpResponse<{}>).status).toBe(401);
        }
    });

    it('should create the first Administator only by the first User', async () => {
        const platformAdminAccount = {
            email: 'admin@test.com',
            password: 'admin'
        };
        const { data: user1 } =
            await client.user.userControllerSignUp(platformAdminAccount);

        expect(user1.email).toBe(platformAdminAccount.email);
        expect(user1.roles).toEqual([0]);
        expect(user1.password).toBeUndefined();

        platformAdmin = { ...user1, ...platformAdminAccount };

        const authorAccount = { email: 'author@test.com', password: 'author' };
        const { data: user2 } =
            await client.user.userControllerSignUp(authorAccount);

        expect(user2.email).toBe(authorAccount.email);
        expect(user2.roles).toEqual([2]);
        expect(user2.password).toBeUndefined();

        commonUser = { ...user2, ...authorAccount };
    });

    it('should sign in a User with Email & Password', async () => {
        const { data: session } = await client.user.userControllerSignIn({
            email: commonUser.email,
            password: commonUser.password
        });

        expect(session.email).toBe(commonUser.email);
        expect(session.token).toStrictEqual(expect.any(String));

        commonUser.token = session.token;
    });

    it('should get the profile of signed-in User with a valid token', async () => {
        const { data: session } = await client.user.userControllerGetSession({
            headers: { Authorization: `Bearer ${commonUser.token}` }
        });
        const { password, token, deletedAt, ...user } = commonUser;

        expect(session).toMatchObject(user);
    });

    it("should get a User's profile by its ID", async () => {
        const { data: user } = await client.user.userControllerGetOne(
            commonUser.id
        );
        const { password, token, deletedAt, ...profile } = commonUser;

        expect(user).toMatchObject(profile);
    });

    it('should edit the profile of signed-in User', async () => {
        const newProfile = { name: 'Hackathon Creator' };

        const { data: user } = await client.user.userControllerUpdateOne(
            commonUser.id,
            newProfile,
            { headers: { Authorization: `Bearer ${commonUser.token}` } }
        );
        expect(user.name).toBe(newProfile.name);
        expect(user.token).not.toBe(commonUser.token);
        expect(user.updatedAt).toStrictEqual(expect.any(String));

        commonUser = { ...commonUser, ...user };
    });

    it('should record 2 activities of a signed-up & edited User', async () => {
        const UID = commonUser.id;
        const activityLog = {
                ...expectedBase,
                tableName: 'User',
                recordId: UID,
                record: expect.any(Object)
            },
            { data } =
                await client.activityLog.activityLogControllerGetUserList(UID);

        expect(data).toMatchObject({
            count: 2,
            list: [
                { ...activityLog, operation: Operation.Create },
                { ...activityLog, operation: Operation.Update }
            ]
        });
    });

    it('should be able to search users by part of email or name', async () => {
        const { data: result_1 } = await client.user.userControllerGetList({
            keywords: platformAdmin.email
        });
        expect(result_1.count).toBe(1);
        expect(result_1.list[0].id).toBe(platformAdmin.id);

        const { data: result_2 } = await client.user.userControllerGetList({
            keywords: commonUser.name
        });
        expect(result_2.count).toBe(1);
        expect(result_2.list[0].id).toBe(commonUser.id);

        const { data: empty } = await client.user.userControllerGetList({
            keywords: 'empty'
        });
        expect(empty).toEqual({ count: 0, list: [] });
    });
});
