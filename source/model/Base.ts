import { IsInt, Min, IsDate, IsOptional } from 'class-validator';
import {
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn
} from 'typeorm';

export abstract class BaseModel {
    @IsInt()
    @Min(1)
    @IsOptional()
    id: number;

    @IsDate()
    @IsOptional()
    createdAt: Date;

    @IsDate()
    @IsOptional()
    updatedAt: Date;
}

export abstract class Base implements BaseModel {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
