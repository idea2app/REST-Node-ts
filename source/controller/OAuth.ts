import { githubClient, User as GitHubUser } from 'mobx-github';
import { Body, HttpCode, JsonController, Post } from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';
import { isDeepStrictEqual } from 'util';

import { dataSource, OAuthSignInData, User } from '../model';
import { ActivityLogController } from './ActivityLog';
import { UserController } from './User';

const store = dataSource.getRepository(User);

@JsonController('/user/OAuth')
export class OauthController {
    @Post('/GitHub')
    @HttpCode(201)
    @ResponseSchema(User)
    async signInWithGithub(@Body() { accessToken }: OAuthSignInData) {
        const { body } = await githubClient.get<GitHubUser>('user', {
            Authorization: `Bearer ${accessToken}`
        });
        const { email, login, avatar_url } = body!;
        const user =
            (await store.findOneBy({ email })) ||
            (await UserController.signUp({ email, password: accessToken }));
        const newProfile = { name: login, avatar: avatar_url },
            oldPofile = { name: user.name, avatar: user.avatar };

        if (!isDeepStrictEqual(oldPofile, newProfile)) {
            await store.save(Object.assign(user, newProfile));

            await ActivityLogController.logUpdate(user, 'User', user.id);
        }
        return UserController.sign(user);
    }
}
