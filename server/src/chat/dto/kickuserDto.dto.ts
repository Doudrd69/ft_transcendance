import {
	IsInt,
	IsNotEmpty,
	Max,
	IsPositive,
} from 'class-validator';

export class kickUserDto {

	@IsNotEmpty()
	@IsPositive()
	@IsInt()
	@Max(1000)
	conversationID: number;

	@IsNotEmpty()
	@IsPositive()
	@IsInt()
	@Max(1000)
	userToKickID: number;

    @IsNotEmpty()
	@IsPositive()
	@IsInt()
	@Max(1000)
	initiatorID: number;
}