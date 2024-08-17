import { Body, JsonController, Post } from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';
import { isDeepStrictEqual } from 'util';

import { dataSource, GitHubUser, OAuthSignInData, User } from '../model';
import { ActivityLogController } from './ActivityLog';
import { UserController } from './User';

const store = dataSource.getRepository(User);

@JsonController('/user/OAuth')
export class OauthController {
    @Post('/GitHub')
    @ResponseSchema(User)
    async signInWithGithub(@Body() { accessToken }: OAuthSignInData) {
        const response = await fetch('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const { email, login, avatar_url } =
            (await response.json()) as GitHubUser;
        const user =
            (await store.findOneBy({ email })) ||
            (await UserController.signUp({ email, password: accessToken }));
        const newProfile = { name: login, avatar: avatar_url },
            oldPofile = { name: user.name, avatar: user.avatar };

        if (!isDeepStrictEqual(oldPofile, newProfile)) {
            await store.update(user.id, newProfile);

            await ActivityLogController.logUpdate(user, 'User', user.id);
        }
        return UserController.sign(user);
    }
}
