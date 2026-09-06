import { NotFoundError } from 'routing-controllers';

import { BaseFilter, User, UserCredential } from '../model';
import { BaseService } from './Base';

export class UserCredentialService extends BaseService<UserCredential> {
    constructor() {
        super(UserCredential);
    }

    getUserList(createdBy: User, filter: BaseFilter) {
        return this.getList(filter, { createdBy: { id: createdBy.id } });
    }

    findByUuidAndEmail(uuid: string, email: string) {
        return this.store.findOne({
            where: { uuid, createdBy: { email } },
            relations: ['createdBy']
        });
    }

    async deleteUserCredential(deletedBy: User, id: number) {
        const credential = await this.store.findOne({
            where: { id, createdBy: { id: deletedBy.id } }
        });

        if (!credential) throw new NotFoundError(`UserCredential ${id} is not found`);

        return this.store.softDelete(id);
    }
}

export const userCredentialService = new UserCredentialService();
