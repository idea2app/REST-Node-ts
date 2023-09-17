import { Type } from 'class-transformer';
import {
    IsEmail,
    IsEnum,
    IsInt,
    IsMobilePhone,
    IsOptional,
    IsString,
    IsStrongPassword,
    IsUrl,
    Min,
    ValidateNested
} from 'class-validator';
import { JsonWebTokenError } from 'jsonwebtoken';
import { ParameterizedContext } from 'koa';
import { NewData } from 'mobx-restful';
import { Column, Entity, ManyToOne } from 'typeorm';

import { Base, BaseFilter, InputData, ListChunk } from './Base';

export enum Gender {
    Female = 0,
    Male = 1,
    Other = 2
}

export enum Role {
    Administrator,
    Manager,
    Client
}

export class UserInput implements Partial<InputData<User>> {
    @IsString()
    name: string;

    @IsEnum(Gender)
    @IsOptional()
    gender?: Gender;

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

    @IsEnum(Role, { each: true })
    @IsOptional()
    roles?: Role[];
}

export type UserInputData<T> = NewData<Omit<T, keyof UserBase>, UserBase>;

export class UserFilter extends BaseFilter implements Partial<InputData<User>> {
    @IsEmail()
    @IsOptional()
    email?: string;

    @IsMobilePhone()
    @IsOptional()
    mobilePhone?: string;

    @IsString()
    @IsOptional()
    name?: string;

    @IsEnum(Gender)
    @IsOptional()
    gender?: Gender;
}

export class UserListChunk implements ListChunk<User> {
    @IsInt()
    @Min(0)
    count: number;

    @Type(() => User)
    @ValidateNested({ each: true })
    list: User[];
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
    context?: ParameterizedContext<JsonWebTokenError | { user: User }>;
}

@Entity()
export class User extends Base {
    @IsString()
    @Column()
    name: string;

    @IsEnum(Gender)
    @IsOptional()
    @Column({ enum: Gender, nullable: true })
    gender?: Gender;

    @IsUrl()
    @IsOptional()
    @Column({ nullable: true })
    avatar?: string;

    @IsEmail()
    @IsOptional()
    @Column({ nullable: true })
    email?: string;

    @IsMobilePhone()
    @IsOptional()
    @Column({ nullable: true })
    mobilePhone?: string;

    @IsStrongPassword()
    @IsOptional()
    @Column({ nullable: true, select: false })
    password?: string;

    @IsEnum(Role, { each: true })
    @Column('simple-json')
    roles: Role[];

    @IsString()
    @IsOptional()
    token?: string;
}

export abstract class UserBase extends Base {
    @Type(() => User)
    @ValidateNested()
    @ManyToOne(() => User)
    createdBy: User;

    @Type(() => User)
    @ValidateNested()
    @IsOptional()
    @ManyToOne(() => User)
    updatedBy?: User;
}
