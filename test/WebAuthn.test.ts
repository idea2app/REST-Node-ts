import 'reflect-metadata';

import { emailFromUserHandle } from '../source/controller/WebAuthn';

describe('WebAuthn controller', () => {
    it('should decode a user handle to an Email address', () => {
        const email = 'client@test.com';

        expect(emailFromUserHandle(Buffer.from(email).toString('base64url'))).toBe(email);
        expect(emailFromUserHandle()).toBeUndefined();
    });
});
