// types.ts

export interface ConversationDm {
	DmId: string;
	name: string;
  }
  
  export interface UserDm {
	UserId: number;
	username: string;
	avatarURL: string;
  }
  
  export interface ConversationChannel {
	id: number;
	name: string;
	is_channel: boolean;
	isPublic: boolean;
	isProtected: boolean;
  }
  
  export interface Channel {
	conversation: ConversationChannel;
	isAdmin: boolean;
  }
  
  export interface UserChannel {
	UserId: number;
	username: string;
	avatarURL: string;
	isOwner: boolean;
	isAdmin: boolean;
	isMute: boolean;
	isBan: boolean;
  }
  
  export interface TargetUser {
	UserId: number;
	username: string;
	avatarURL: string;
  }
  