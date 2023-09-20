import { Conversation } from "../entities/conversation.entity";

export class MessageDto {
	from_user: string;
	content: string;
	post_datetime: Date;
	conversation: Conversation;
}