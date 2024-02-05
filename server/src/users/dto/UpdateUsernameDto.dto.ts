import {
	IsAlphanumeric,
	IsAscii,
	IsNotEmpty,
	IsPositive,
	Length,
	Matches,
	Max,
	IsInt,
	IsAlpha,
	IsString,
} from 'class-validator';

export class UpdateUsernameDto {

	@IsNotEmpty()
	@IsPositive()
	@IsInt()
	@Max(1000)
	userID: number;

	@IsNotEmpty()
	@Length(4, 20)
	@IsAscii()
	@IsAlpha()
	@IsString()
	@Matches(/^[^"';%()|<>\\]*$/)
	newUsername: string;
}