import { IsInt, Min, IsDateString } from 'class-validator';

export abstract class Base {
    @IsInt()
    @Min(1)
    id: number;

    @IsDateString()
    createdAt: string;

    @IsDateString()
    updatedAt: string;
}
