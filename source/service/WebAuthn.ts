import type {
    AuthenticatorAssertionResponseJSON,
    AuthenticatorAttestationResponseJSON,
    CollectedClientData
} from '@passwordless-id/webauthn' with { 'resolution-mode': 'import' };

import { UserCredential } from '../model';
import { UserServiceWithLog } from './User';

export class UserCredentialService extends UserServiceWithLog<UserCredential> {
    static extractClientData = ({
        clientDataJSON
    }:
        | AuthenticatorAttestationResponseJSON
        | AuthenticatorAssertionResponseJSON): CollectedClientData =>
        JSON.parse(atob(clientDataJSON));

    constructor() {
        super(UserCredential);
    }
}

export const userCredentialService = new UserCredentialService();
