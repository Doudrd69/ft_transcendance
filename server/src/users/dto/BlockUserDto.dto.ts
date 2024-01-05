import {
    IsNotEmpty,
    IsString
} from 'class-validator';

export class BlockUserDto {

	@IsNotEmpty()
	@IsString()
	initiatorLogin: string;

	@IsNotEmpty()
    @IsString()
	recipientLogin: string;
}