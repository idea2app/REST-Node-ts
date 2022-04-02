import { IsString } from 'class-validator';
import { Entity, Column } from 'typeorm';

import { BaseModel, Base } from './Base';

export class HomeModel extends BaseModel {
    @IsString()
    content: string;
}

@Entity()
export class Home extends Base implements HomeModel {
    @Column({ type: 'text' })
    content: string;
}
