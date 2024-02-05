import {
	IsAlphanumeric,
	IsAscii,
	IsNotEmpty,
	IsOptional,
	Length,
	Matches,
	IsInt,
	IsPositive,
	Max,
	IsAlpha,
	IsString,
} from 'class-validator';

export class FriendRequestDto {

	@IsOptional()
	@IsNotEmpty()
	@IsPositive()
	@IsInt()
	@Max(1000)
	initiatorID: number;

	@IsNotEmpty()
	@Length(4, 20)
	@IsAscii()
	@IsAlpha()
	@IsString()
	@Matches(/^[^"';%()|<>\\]*$/)
	recipientLogin: string;
}
