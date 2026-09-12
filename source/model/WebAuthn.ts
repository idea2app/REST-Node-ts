import type {
    AuthenticationJSON,
    AuthenticatorAssertionResponseJSON,
    AuthenticatorAttestationResponseJSON,
    AuthenticatorInfo,
    RegistrationJSON,
    UserInfo
} from '@passwordless-id/webauthn' with { 'resolution-mode': 'import' };
import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsObject,
    IsOptional,
    IsString,
    IsUrl,
    IsUUID,
    Min,
    ValidateNested
} from 'class-validator';
import { Column, Entity } from 'typeorm';

import { ListChunk } from './Base';
import { UserBase } from './User';

export class WebAuthnChallenge {
    @IsString()
    string: string;
}

export enum CredentialType {
    PublicKey = 'public-key'
}

export enum AuthenticatorAttachment {
    Platform = 'platform',
    CrossPlatform = 'cross-platform'
}

export class WebAuthnUser implements UserInfo {
    @IsString()
    @IsOptional()
    id: string;

    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    displayName: string;
}

export abstract class WebAuthnBase implements Omit<RegistrationJSON, 'response' | 'user'> {
    @IsEnum(CredentialType)
    type: CredentialType;

    @IsString()
    id: string;

    @IsString()
    rawId: string;

    @IsEnum(AuthenticatorAttachment)
    @IsOptional()
    authenticatorAttachment?: AuthenticatorAttachment;

    @IsObject()
    clientExtensionResults: AuthenticationExtensionsClientOutputs;

    @IsString()
    challenge: string;
}

export class WebAuthnRegistration extends WebAuthnBase implements RegistrationJSON {
    @IsObject()
    response: AuthenticatorAttestationResponseJSON;

    @Type(() => WebAuthnUser)
    @ValidateNested()
    user: WebAuthnUser;
}

export class WebAuthnAuthentication extends WebAuthnBase implements AuthenticationJSON {
    @IsObject()
    response: AuthenticatorAssertionResponseJSON;
}

export enum CredentialAlgorithm {
    RS256 = 'RS256',
    ES256 = 'ES256',
    EdDSA = 'EdDSA'
}

export enum AuthenticatorTransportType {
    BLE = 'ble',
    Hybrid = 'hybrid',
    Internal = 'internal',
    NFC = 'nfc',
    USB = 'usb',
    SmartCard = 'smart-card'
}

export class WebAuthnAuthenticator implements AuthenticatorInfo {
    @IsUUID()
    aaguid: string;

    @IsString()
    name: string;

    @IsUrl()
    icon_light: string;

    @IsUrl()
    icon_dark: string;

    @IsInt()
    @Min(0)
    counter: number;
}

@Entity()
export class UserCredential extends UserBase {
    @IsString()
    @Column()
    uuid: string;

    @IsString()
    @Column()
    publicKey: string;

    @IsEnum(CredentialAlgorithm)
    @Column({ type: 'simple-enum', enum: CredentialAlgorithm })
    algorithm: CredentialAlgorithm;

    @IsEnum(AuthenticatorTransportType, { each: true })
    @Column({ type: 'simple-json' })
    transports: AuthenticatorTransportType[];

    @Type(() => WebAuthnAuthenticator)
    @ValidateNested()
    @Column({ type: 'simple-json' })
    authenticator: WebAuthnAuthenticator;

    @IsBoolean()
    @Column('boolean')
    synced: boolean;

    @IsBoolean()
    @Column('boolean')
    userVerified: boolean;
}

export class UserCredentialListChunk implements ListChunk<UserCredential> {
    @IsInt()
    @Min(0)
    count: number;

    @Type(() => UserCredential)
    @ValidateNested({ each: true })
    list: UserCredential[];
}
