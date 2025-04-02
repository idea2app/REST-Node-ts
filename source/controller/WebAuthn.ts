import { server } from '@passwordless-id/webauthn';
import { CollectedClientData } from '@passwordless-id/webauthn/dist/esm/types';
import {
    BadRequestError,
    Body,
    HttpCode,
    JsonController,
    Post
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import {
    dataSource,
    User,
    UserCredential,
    WebAuthnAuthentication,
    WebAuthnChallenge,
    WebAuthnRegistration
} from '../model';
import { ActivityLogController } from './ActivityLog';
import { UserController } from './User';

const credentialStore = dataSource.getRepository(UserCredential);

@JsonController('/user/WebAuthn')
export class WebAuthnController {
    @Post('/challenge')
    @HttpCode(201)
    @ResponseSchema(WebAuthnChallenge)
    createChallenge() {
        return { string: server.randomChallenge() };
    }

    @Post('/registration')
    @HttpCode(201)
    @ResponseSchema(User)
    async signUp(@Body() { challenge, ...registration }: WebAuthnRegistration) {
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
        const createdBy = await UserController.signUp({
            email: name,
            password: id
        });
        const saved = await credentialStore.save({
            createdBy,
            uuid,
            authenticator,
            ...credential,
            synced,
            userVerified
        } as UserCredential);

        await ActivityLogController.logCreate(
            createdBy,
            'UserCredential',
            saved.id
        );
        return UserController.sign(createdBy);
    }

    @Post('/authentication')
    @HttpCode(201)
    @ResponseSchema(User)
    async signIn(
        @Body() { challenge, ...authentication }: WebAuthnAuthentication
    ) {
        const userCredential = await credentialStore.findOne({
            where: { uuid: authentication.id },
            relations: ['createdBy']
        });
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
        return UserController.sign(createdBy);
    }
}
