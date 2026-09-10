import type { CollectedClientData } from '@passwordless-id/webauthn' with {
    'resolution-mode': 'import'
};
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
import { sessionService, UserCredentialService, userCredentialService } from '../service';

const WebAuthn = import('@passwordless-id/webauthn');

@JsonController('/user/WebAuthn')
export class WebAuthnController {
    @Post('/challenge')
    @HttpCode(201)
    @ResponseSchema(WebAuthnChallenge)
    async createChallenge() {
        const { server } = await WebAuthn;

        return { string: server.randomChallenge() };
    }

    @Get('/session/credential')
    @Authorized()
    @ResponseSchema(UserCredentialListChunk)
    getCredentialList(@CurrentUser() { id }: User, @QueryParams() filter: BaseFilter) {
        return userCredentialService.getUserList(id, filter);
    }

    @Post('/session/credential')
    @Authorized()
    @HttpCode(201)
    @ResponseSchema(UserCredential)
    async saveCredential(
        @CurrentUser() createdBy: User,
        @Body() { challenge, ...registration }: WebAuthnRegistration
    ) {
        if (!createdBy.email || registration.user?.id !== createdBy.email)
            throw new BadRequestError('Invalid credential user');

        const { server } = await WebAuthn;

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

        return userCredentialService.createOne(
            {
                uuid,
                authenticator,
                ...credential,
                synced,
                userVerified
            } as UserCredential,
            createdBy
        );
    }

    @Delete('/session/credential/:cid')
    @Authorized()
    @OnUndefined(204)
    async deleteCredential(@CurrentUser() deletedBy: User, @Param('cid') id: number) {
        await userCredentialService.deleteOne(id, deletedBy);
    }

    @Post('/authentication')
    @HttpCode(201)
    @ResponseSchema(User)
    async signIn(@Body() { challenge, ...authentication }: WebAuthnAuthentication) {
        const email = UserCredentialService.emailFromUserHandle(authentication.response.userHandle),
            userCredential =
                email && (await userCredentialService.findByUuidAndEmail(authentication.id, email));

        if (!userCredential) throw new BadRequestError('Invalid credential');

        const { server } = await WebAuthn;

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
