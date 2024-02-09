import {
	Max,
	IsNotEmpty,
	IsPositive,
	IsInt,
} from 'class-validator';

export class BlockUserDto {

	@IsNotEmpty()
	@IsPositive()
	@IsInt()
	@Max(1000)
	recipientID: number;
}