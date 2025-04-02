import {
    AuthenticationJSON,
    AuthenticatorAssertionResponseJSON,
    AuthenticatorAttestationResponseJSON,
    AuthenticatorInfo,
    RegistrationJSON,
    UserInfo
} from '@passwordless-id/webauthn/dist/esm/types';
import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsEnum,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested
} from 'class-validator';
import { Column, Entity } from 'typeorm';

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

export abstract class WebAuthnBase
    implements Omit<RegistrationJSON, 'response' | 'user'>
{
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

export class WebAuthnRegistration
    extends WebAuthnBase
    implements RegistrationJSON
{
    @IsObject()
    response: AuthenticatorAttestationResponseJSON;

    @Type(() => WebAuthnUser)
    @ValidateNested()
    user: WebAuthnUser;
}

export class WebAuthnAuthentication
    extends WebAuthnBase
    implements AuthenticationJSON
{
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
    @IsString()
    aaguid: string;

    @IsString()
    name: string;

    @IsString()
    icon_light: string;

    @IsString()
    icon_dark: string;

    @IsNumber()
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
