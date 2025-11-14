import { createHash } from 'crypto';
import { sign } from 'jsonwebtoken';

import { dataSource, JWTAction, Role, SignInData, User } from '../model';
import { APP_SECRET } from '../utility';
import { activityLogService } from './ActivityLog';

export class SessionService {
    userStore = dataSource.getRepository(User);

    encrypt = (raw: string) =>
        createHash('sha1')
            .update(APP_SECRET + raw)
            .digest('hex');

    sign = (user: User): User => ({
        ...user,
        token: sign({ ...user }, APP_SECRET)
    });

    async signUp({ email, password }: SignInData) {
        const { userStore } = this;

        const sum = await userStore.count();

        const { password: _, ...user } = await userStore.save({
            name: email,
            email,
            password: this.encrypt(password),
            roles: [sum ? Role.Client : Role.Administrator]
        });
        await activityLogService.logCreate(user, 'User', user.id);

        return user;
    }

    checkJWT = ({ context: { state } }: JWTAction) =>
        'user' in state ? state.user : (console.error(state.jwtOriginalError), null);
}

export const sessionService = new SessionService();
