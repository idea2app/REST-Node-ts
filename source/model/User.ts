import { Type } from 'class-transformer';
import {
    IsDate,
    IsEmail,
    IsEnum,
    IsInt,
    IsMobilePhone,
    IsOptional,
    IsPhoneNumber,
    IsString,
    IsUrl,
    Min,
    ValidateNested
} from 'class-validator';
import { JsonWebTokenError } from 'jsonwebtoken';
import { ParameterizedContext } from 'koa';
import { Column, Entity, ManyToOne } from 'typeorm';

import { Base, BaseFilter, BaseModel, ListChunk, UserBaseModel } from './Base';

export enum Gender {
    Female,
    Male,
    Other
}

export enum Role {
    Administrator,
    Manager,
    Client
}

export class UserInput {
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

export class UserFilter extends BaseFilter implements Partial<UserInput> {
    @IsEmail()
    @IsOptional()
    email?: string;

    @IsPhoneNumber()
    @IsOptional()
    mobilePhone?: string;

    @IsString()
    @IsOptional()
    name?: string;

    @IsEnum(Gender)
    @IsOptional()
    gender?: Gender;
}

export class UserOutput extends UserInput implements BaseModel {
    @IsInt()
    @Min(1)
    id: number;

    @IsDate()
    createdAt: Date;

    @IsDate()
    @IsOptional()
    updatedAt?: Date;

    @IsString()
    @IsOptional()
    token?: string;
}

export class UserListChunk implements ListChunk<UserOutput> {
    @IsInt()
    @Min(0)
    count: number;

    @Type(() => UserOutput)
    @ValidateNested({ each: true })
    list: UserOutput[];
}

export class SignInData
    implements Required<Pick<UserInput, 'email' | 'password'>>
{
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}

export class SignUpData
    extends SignInData
    implements Required<Pick<UserInput, 'name' | 'email' | 'password'>>
{
    @IsString()
    name: string;
}

export interface JWTAction {
    context?: ParameterizedContext<JsonWebTokenError | { user: UserOutput }>;
}

@Entity()
export class User extends Base implements UserInput {
    @Column()
    name: string;

    @Column({ enum: Gender, nullable: true })
    gender?: Gender;

    @Column({ nullable: true })
    avatar: string;

    @Column({ nullable: true })
    email?: string;

    @Column({ nullable: true })
    mobilePhone?: string;

    @Column({ select: false })
    password: string;

    @Column('simple-json')
    roles: Role[];
}

export abstract class UserBase extends Base implements UserBaseModel {
    @ManyToOne(() => User)
    createdBy: User;

    @ManyToOne(() => User)
    updatedBy: User;
}
