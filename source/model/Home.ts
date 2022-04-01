import { IsString } from 'class-validator';

import { Base } from './Base';

export class Home extends Base {
    @IsString()
    content: string;
}
