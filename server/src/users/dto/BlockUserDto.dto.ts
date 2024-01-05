import {
    IsNotEmpty,
    IsString
} from 'class-validator';

export class BlockUserDtoDto {

	@IsNotEmpty()
	@IsString()
	initiatorLogin: string;

	@IsNotEmpty()
    @IsString()
	recipientLogin: string;
}