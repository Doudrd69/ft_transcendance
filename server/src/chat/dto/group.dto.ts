import { User } from "../../users/entities/users.entity";
import { Conversation } from "../entities/conversation.entity";

export class GroupDto {
	conversation: Conversation;
	user: User;
}