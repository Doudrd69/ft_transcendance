import {
	IsAscii,
	IsNotEmpty,
	IsString,
	Length,
	Matches
} from 'class-validator';

export class MessageDto {

	@IsNotEmpty()
	@IsString()
	from: string;

	@IsNotEmpty()
	@IsString()
	@IsAscii()
	@Matches(/^[^"';%()|<>\\]*$/)
	@Length(1, 180)
	content: string;

	@IsNotEmpty()
	// @IsDate()
	post_datetime: Date;

	@IsNotEmpty()
	conversationID: number;
}