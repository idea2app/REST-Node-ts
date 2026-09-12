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
        return userCredentialService.getList(filter, { createdBy: { id } });
    }

    @Post('/registration')
    @Authorized()
    @HttpCode(201)
    @ResponseSchema(UserCredential)
    async signUp(
        @CurrentUser() createdBy: User,
        @Body() { challenge, ...registration }: WebAuthnRegistration
    ) {
        const { server } = await WebAuthn;
        const { origin } = UserCredentialService.extractClientData(registration.response);
        const {
            authenticator,
            credential: { id: uuid, ...credential },
            synced,
            user: { name },
            userVerified
        } = await server.verifyRegistration(registration, {
            challenge,
            origin
        });

        if (name !== createdBy.email) throw new BadRequestError('Invalid credential user');

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
        const { server } = await WebAuthn;

        const userCredential = await userCredentialService.store.findOne({
            where: { uuid: authentication.id },
            relations: { createdBy: true }
        });

        if (!userCredential) throw new BadRequestError('Invalid credential');

        const { uuid, userVerified, createdBy, ...credential } = userCredential,
            { origin } = UserCredentialService.extractClientData(authentication.response);

        await server.verifyAuthentication(
            authentication,
            { ...credential, id: uuid },
            { origin, challenge, userVerified }
        );
        return sessionService.sign(createdBy);
    }
}
