import {
    IsNotEmpty,
    IsString,
	Matches,
} from 'class-validator';

export class BlockUserDto {

	@IsNotEmpty()
	@IsString()
	@Matches(/^[^"';%()|<>\\]*$/)
	initiatorLogin: string;

	@IsNotEmpty()
    @IsString()
	@Matches(/^[^"';%()|<>\\]*$/)
	recipientLogin: string;
}