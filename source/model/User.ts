import {
    IsString,
    IsEmail,
    IsUrl,
    IsMobilePhone,
    IsOptional
} from 'class-validator';
import { Entity, Column, Index } from 'typeorm';
import { JsonWebTokenError } from 'jsonwebtoken';
import { ParameterizedContext } from 'koa';

import { BaseModel, Base } from './Base';

export class UserModel extends BaseModel {
    @IsString()
    name: string;

    @IsUrl()
    @IsOptional()
    avatar: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsMobilePhone()
    @IsOptional()
    mobilePhone?: string;

    @IsString()
    @IsOptional()
    password?: string;

    @IsString()
    @IsOptional()
    token?: string;
}

export class SignInData implements Required<Pick<User, 'email' | 'password'>> {
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}

export class SignUpData
    extends SignInData
    implements Required<Pick<User, 'name' | 'email' | 'password'>>
{
    @IsString()
    name: string;
}

export interface JWTAction {
    context?: ParameterizedContext<JsonWebTokenError | { user: UserModel }>;
}

@Entity()
export class User extends Base implements UserModel {
    @Column()
    name: string;

    @Column({ nullable: true })
    avatar: string;

    @Index({ unique: true })
    @Column({ nullable: true })
    email?: string;

    @Index({ unique: true })
    @Column({ nullable: true })
    mobilePhone?: string;

    @Column({ select: false })
    password: string;
}
