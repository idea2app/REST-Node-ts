import { BaseFilter, UserCredential } from '../model';
import { UserServiceWithLog } from './User';

export class UserCredentialService extends UserServiceWithLog<UserCredential> {
    static emailFromUserHandle = (userHandle?: string) =>
        userHandle && Buffer.from(userHandle, 'base64url').toString();

    constructor() {
        super(UserCredential);
    }

    getUserList(id: number, filter: BaseFilter) {
        return this.getList(filter, { createdBy: { id } });
    }

    findByUuidAndEmail(uuid: string, email: string) {
        return this.store.findOne({
            where: { uuid, createdBy: { email } },
            relations: { createdBy: true }
        });
    }
}

export const userCredentialService = new UserCredentialService();
