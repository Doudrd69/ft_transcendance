import {
	IsAlphanumeric,
	IsAscii,
	IsNotEmpty,
	IsOptional,
	Length,
	Matches,
	IsInt,
	IsPositive,
	Max
} from 'class-validator';

export class FriendRequestDto {

	// PRENDRE UN ID
	@IsOptional()
	@IsNotEmpty()
	@IsPositive()
	@IsInt()
	@Max(1000)
	initiatorID: number;

	@IsNotEmpty()
	@Length(6, 20)
	@IsAscii()
	@IsAlphanumeric()
	@Matches(/^[^"';%()|<>\\]*$/)
	recipientLogin: string;
}
