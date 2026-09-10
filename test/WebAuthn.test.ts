import 'reflect-metadata';

import { UserCredentialService } from '../source/service';

describe('WebAuthn controller', () => {
    it('should decode a user handle to an Email address', () => {
        const email = 'client@test.com';

        expect(
            UserCredentialService.emailFromUserHandle(Buffer.from(email).toString('base64url'))
        ).toBe(email);
        expect(UserCredentialService.emailFromUserHandle()).toBeUndefined();
    });
});
