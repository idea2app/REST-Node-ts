import { BaseFilter, User, UserCredential } from '../model';
import { UserServiceWithLog } from './User';

/**
 * WebAuthn user credential management service.
 */
export class UserCredentialService extends UserServiceWithLog<UserCredential> {
    constructor() {
        super(UserCredential, ['uuid']);
    }

    /**
     * Retrieve paginated credentials belonging to the specified user.
     */
    getUserList(user: User, filter?: BaseFilter) {
        return this.getList({ ...filter, createdBy: user.id });
    }

    /**
     * Find credential by its unique credential ID and associated user email.
     */
    findByUuidAndEmail(uuid: string, email: string) {
        return this.store.findOne({
            where: { uuid, createdBy: { email } },
            relations: ['createdBy']
        });
    }
}

export const userCredentialService = new UserCredentialService();
