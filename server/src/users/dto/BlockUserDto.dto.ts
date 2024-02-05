import {
    IsNotEmpty,
    IsString,
	Matches,
	Length,
	IsAscii,
	IsAlpha,
} from 'class-validator';

export class BlockUserDto {

	@IsNotEmpty()
	@Length(4, 20)
	@IsAscii()
	@IsAlpha()
	@IsString()
	@Matches(/^[^"';%()|<>\\]*$/)
	initiatorLogin: string;

	@IsNotEmpty()
	@Length(4, 20)
	@IsAscii()
	@IsAlpha()
	@IsString()
	@Matches(/^[^"';%()|<>\\]*$/)
	recipientLogin: string;
}