import { server } from '@passwordless-id/webauthn';
import { CollectedClientData } from '@passwordless-id/webauthn/dist/esm/types';
import {
    Authorized,
    BadRequestError,
    Body,
    CurrentUser,
    Delete,
    Get,
    HttpCode,
    JsonController,
    OnUndefined,
    Param,
    Post,
    QueryParams
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import {
    BaseFilter,
    User,
    UserCredential,
    UserCredentialListChunk,
    WebAuthnAuthentication,
    WebAuthnChallenge,
    WebAuthnRegistration
} from '../model';
import { activityLogService, sessionService, userCredentialService } from '../service';

@JsonController('/user/WebAuthn')
export class WebAuthnController {
    @Post('/challenge')
    @HttpCode(201)
    @ResponseSchema(WebAuthnChallenge)
    createChallenge() {
        return { string: server.randomChallenge() };
    }

    @Get('/session/credential')
    @Authorized()
    @ResponseSchema(UserCredentialListChunk)
    getCredentialList(@CurrentUser() user: User, @QueryParams() filter: BaseFilter) {
        return userCredentialService.getUserList(user, filter);
    }

    @Post('/session/credential')
    @Authorized()
    @HttpCode(201)
    @ResponseSchema(UserCredential)
    async createCredential(
        @CurrentUser() createdBy: User,
        @Body() { challenge, ...registration }: WebAuthnRegistration
    ) {
        if (!createdBy.email || registration.user?.id !== createdBy.email)
            throw new BadRequestError('Invalid credential user');

        const { origin } = JSON.parse(
            atob(registration.response.clientDataJSON)
        ) as CollectedClientData;

        const {
            authenticator,
            credential: { id: uuid, ...credential },
            synced,
            user: { id, name },
            userVerified
        } = await server.verifyRegistration(registration, {
            challenge,
            origin
        });

        if (id !== createdBy.email || name !== createdBy.email)
            throw new BadRequestError('Invalid credential user');

        const saved = await userCredentialService.createOne({
            createdBy,
            uuid,
            authenticator,
            ...credential,
            synced,
            userVerified
        } as UserCredential);

        await activityLogService.logCreate(createdBy, 'UserCredential', saved.id);

        return saved;
    }

    @Delete('/session/credential/:cid')
    @Authorized()
    @OnUndefined(204)
    async deleteCredential(@CurrentUser() deletedBy: User, @Param('cid') id: number) {
        await userCredentialService.deleteUserCredential(deletedBy, id);

        await activityLogService.logDelete(deletedBy, 'UserCredential', id);
    }

    @Post('/authentication')
    @HttpCode(201)
    @ResponseSchema(User)
    async signIn(@Body() { challenge, ...authentication }: WebAuthnAuthentication) {
        const email = emailFromUserHandle(authentication.response.userHandle),
            userCredential =
                email && (await userCredentialService.findByUuidAndEmail(authentication.id, email));

        if (!userCredential) throw new BadRequestError('Invalid credential');

        const { uuid, userVerified, createdBy, ...credential } = userCredential,
            { origin } = JSON.parse(
                atob(authentication.response.clientDataJSON)
            ) as CollectedClientData;

        await server.verifyAuthentication(
            authentication,
            { ...credential, id: uuid },
            { origin, challenge, userVerified }
        );
        return sessionService.sign(createdBy);
    }
}

export const emailFromUserHandle = (userHandle?: string) =>
    userHandle && Buffer.from(userHandle, 'base64url').toString();
