import {
	IsInt,
	IsNotEmpty,
	IsPositive,
	Max
} from 'class-validator';

export class DeleteFriendRequestDto {

	@IsNotEmpty()
	@IsPositive()
	@IsInt()
	@Max(1000)
	friendID: number;
}
