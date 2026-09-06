import { emailFromUserHandle } from '../source/controller/WebAuthn';
import {
    AuthenticatorTransportType,
    CredentialAlgorithm,
    CredentialType,
    dataSource,
    Operation,
    User as UserModel
} from '../source/model';
import { userCredentialService } from '../source/service';
import { HttpResponse, User } from './client';
import { client } from './shared';

describe('WebAuthn service & controller', () => {
    let testUser1: User;
    let testUser2: User;
    let cred1Id: number;
    let cred2Id: number;

    beforeAll(async () => {
        if (!dataSource.isInitialized) await dataSource.initialize();

        const acc1 = { email: 'webauthn1@test.com', password: 'password123' };
        const acc2 = { email: 'webauthn2@test.com', password: 'password456' };

        const { data: u1 } = await client.user.userControllerSignUp(acc1);
        const { data: u2 } = await client.user.userControllerSignUp(acc2);

        const { data: s1 } = await client.user.userControllerSignIn(acc1);
        const { data: s2 } = await client.user.userControllerSignIn(acc2);

        testUser1 = { ...u1, token: s1.token };
        testUser2 = { ...u2, token: s2.token };

        const createdCred1 = await userCredentialService.createOne(
            {
                uuid: 'cred-uuid-user-1',
                publicKey: 'fake-public-key-1',
                algorithm: CredentialAlgorithm.ES256,
                transports: [AuthenticatorTransportType.Internal],
                authenticator: {
                    aaguid: '00000000-0000-0000-0000-000000000001',
                    name: 'Key 1',
                    icon_light: '',
                    icon_dark: '',
                    counter: 0
                },
                synced: false,
                userVerified: true
            },
            testUser1 as unknown as UserModel
        );
        cred1Id = createdCred1.id;

        const createdCred2 = await userCredentialService.createOne(
            {
                uuid: 'cred-uuid-user-2',
                publicKey: 'fake-public-key-2',
                algorithm: CredentialAlgorithm.ES256,
                transports: [AuthenticatorTransportType.Internal],
                authenticator: {
                    aaguid: '00000000-0000-0000-0000-000000000002',
                    name: 'Key 2',
                    icon_light: '',
                    icon_dark: '',
                    counter: 0
                },
                synced: false,
                userVerified: true
            },
            testUser2 as unknown as UserModel
        );
        cred2Id = createdCred2.id;
    });

    afterAll(async () => {
        if (dataSource.isInitialized) await dataSource.destroy();
    });

    describe('emailFromUserHandle helper', () => {
        it('should return undefined when userHandle is undefined or empty', () => {
            expect(emailFromUserHandle(undefined)).toBeUndefined();
            expect(emailFromUserHandle('')).toBeUndefined();
        });

        it('should decode base64url encoded email address', () => {
            const rawEmail = 'member@example.com';
            const encoded = Buffer.from(rawEmail).toString('base64url');

            expect(emailFromUserHandle(encoded)).toBe(rawEmail);
        });

        it('should return raw email if already plain text', () => {
            expect(emailFromUserHandle('direct@example.com')).toBe('direct@example.com');
        });
    });

    describe('WebAuthn endpoints & service scoping', () => {
        it('should generate a random WebAuthn challenge', async () => {
            const { data } = await client.user.webAuthnControllerCreateChallenge();

            expect(typeof data.string).toBe('string');
            expect(data.string.length).toBeGreaterThan(0);
        });

        it('should reject unauthenticated request to get credential list', async () => {
            try {
                await client.user.webAuthnControllerGetCredentialList();
                fail('Expected 401 error');
            } catch (error) {
                expect((error as HttpResponse<unknown>).status).toBe(401);
            }
        });

        it('should list only credentials belonging to current authenticated user', async () => {
            const { data: result1 } = await client.user.webAuthnControllerGetCredentialList(
                {},
                { headers: { Authorization: `Bearer ${testUser1.token}` } }
            );

            expect(result1.count).toBe(1);
            expect(result1.list[0].id).toBe(cred1Id);
            expect(result1.list[0].uuid).toBe('cred-uuid-user-1');

            const { data: result2 } = await client.user.webAuthnControllerGetCredentialList(
                {},
                { headers: { Authorization: `Bearer ${testUser2.token}` } }
            );

            expect(result2.count).toBe(1);
            expect(result2.list[0].id).toBe(cred2Id);
            expect(result2.list[0].uuid).toBe('cred-uuid-user-2');
        });

        it('should find credential by uuid and matching email in service', async () => {
            const matched = await userCredentialService.findByUuidAndEmail(
                'cred-uuid-user-1',
                testUser1.email
            );
            expect(matched).not.toBeNull();
            expect(matched?.id).toBe(cred1Id);
            expect(matched?.createdBy.id).toBe(testUser1.id);

            const mismatched = await userCredentialService.findByUuidAndEmail(
                'cred-uuid-user-1',
                testUser2.email
            );
            expect(mismatched).toBeNull();

            const nonExistent = await userCredentialService.findByUuidAndEmail(
                'unknown-uuid',
                testUser1.email
            );
            expect(nonExistent).toBeNull();
        });

        it('should reject authentication when credential or email does not match', async () => {
            try {
                await client.user.webAuthnControllerSignIn({
                    id: 'cred-uuid-user-1',
                    rawId: 'cred-uuid-user-1',
                    type: CredentialType.PublicKey,
                    challenge: 'random-challenge',
                    clientExtensionResults: {},
                    response: {
                        clientDataJSON: Buffer.from(
                            JSON.stringify({ origin: 'http://localhost' })
                        ).toString('base64'),
                        authenticatorData: 'auth-data',
                        signature: 'signature',
                        userHandle: Buffer.from('wrong@test.com').toString('base64url')
                    }
                });
                fail('Expected 400 error');
            } catch (error) {
                expect((error as HttpResponse<unknown>).status).toBe(400);
            }
        });

        it('should forbid non-owner from deleting another user credential', async () => {
            try {
                await client.user.webAuthnControllerDeleteCredential(cred1Id, {
                    headers: { Authorization: `Bearer ${testUser2.token}` }
                });
                fail('Expected 403 error');
            } catch (error) {
                expect((error as HttpResponse<unknown>).status).toBe(403);
            }
        });

        it('should allow owner to delete credential and log activity', async () => {
            const { status } = await client.user.webAuthnControllerDeleteCredential(cred1Id, {
                headers: { Authorization: `Bearer ${testUser1.token}` }
            });
            expect(status).toBe(204);

            const { data: result } = await client.user.webAuthnControllerGetCredentialList(
                {},
                { headers: { Authorization: `Bearer ${testUser1.token}` } }
            );
            expect(result.count).toBe(0);
            expect(result.list).toHaveLength(0);

            const { data: logs } = await client.activityLog.activityLogControllerGetUserList(
                testUser1.id
            );
            const deleteLog = logs.list.find(
                log => log.tableName === 'UserCredential' && log.operation === Operation.Delete
            );
            expect(deleteLog).toBeDefined();
            expect(deleteLog?.recordId).toBe(cred1Id);
        });
    });
});
