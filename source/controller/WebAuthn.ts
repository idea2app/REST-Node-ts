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
import { sessionService, userCredentialService } from '../service';

/**
 * Extract email address from WebAuthn assertion userHandle.
 */
export const emailFromUserHandle = (userHandle?: string) => {
    if (!userHandle) return;

    if (userHandle.includes('@')) return userHandle;

    const decoded = Buffer.from(userHandle, 'base64url').toString();

    return decoded.includes('@') ? decoded : userHandle;
};

@JsonController('/user/WebAuthn')
export class WebAuthnController {
    /**
     * Generate a cryptographic challenge for WebAuthn ceremonies.
     */
    @Post('/challenge')
    @HttpCode(201)
    @ResponseSchema(WebAuthnChallenge)
    createChallenge() {
        return { string: server.randomChallenge() };
    }

    /**
     * Retrieve paginated list of WebAuthn credentials for current authenticated user.
     */
    @Get('/session/credential')
    @Authorized()
    @ResponseSchema(UserCredentialListChunk)
    getCredentialList(@CurrentUser() user: User, @QueryParams() filter: BaseFilter) {
        return userCredentialService.getUserList(user, filter);
    }

    /**
     * Register a new WebAuthn credential for current authenticated user.
     */
    @Post('/session/credential')
    @Authorized()
    @HttpCode(201)
    @ResponseSchema(UserCredential)
    async createCredential(
        @CurrentUser() createdBy: User,
        @Body() { challenge, ...registration }: WebAuthnRegistration
    ) {
        const { origin } = JSON.parse(
            atob(registration.response.clientDataJSON)
        ) as CollectedClientData;

        const {
            authenticator,
            credential: { id: uuid, ...credential },
            synced,
            userVerified
        } = await server.verifyRegistration(registration, {
            challenge,
            origin
        });

        return userCredentialService.createOne(
            {
                uuid,
                authenticator,
                ...credential,
                synced,
                userVerified
            } as unknown as UserCredential,
            createdBy
        );
    }

    /**
     * Delete a specific WebAuthn credential by ID for current authenticated user.
     */
    @Delete('/session/credential/:cid')
    @Authorized()
    @OnUndefined(204)
    async deleteCredential(@CurrentUser() deletedBy: User, @Param('cid') cid: number) {
        await userCredentialService.deleteOne(cid, deletedBy);
    }

    /**
     * Authenticate user session with WebAuthn credential assertion.
     */
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
