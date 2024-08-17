import { components } from '@octokit/openapi-types';
import { IsString } from 'class-validator';

export class OAuthSignInData {
    @IsString()
    accessToken: string;
}

export type GitHubUser = components['schemas']['simple-user'];
