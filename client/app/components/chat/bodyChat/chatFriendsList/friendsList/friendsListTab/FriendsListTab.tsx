import { useGlobal } from '@/app/GlobalContext';
import { useChat } from '@/app/components/chat/ChatContext';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import ListMyChannelComponent from '../../../listMyChannel/ListMyChannel';
import ConfirmationComponent from '../../confirmation/Confirmation';
import './FriendsListTab.css';

interface User {
	id: number;
	username: string;
	isBlocked: boolean;
}


interface FriendsListTabComponentProps {
	user: User;
	all: boolean
}

interface targetStat{
	id: number;
	username: string;
}

interface Conversation {
	name: string,
	id: number,
}


const FriendsListTabComponent: React.FC<FriendsListTabComponentProps> = ({ user, all }) => {

	const { chatState, chatDispatch } = useChat();
	const { globalState, dispatch } = useGlobal();
	const [gameSocketConnected, setgameSocketConnected] = useState<boolean>(false);
	const [gameInviteValidation, setgameInviteValidation] = useState<boolean>(false);
	const [confirmationText, setConfirmationText] = useState('');
	const [funtionToExecute, setFunctionToExecute] = useState<() => void>(() => { });
	const [accepted, setAccepted] = useState(false);
	chatState.currentTargetStats = useState<targetStat>({id : user.id, username: user.username});

	const handleDms = async() => {

		try {
			const createDMConversationDto = {
				user1: Number(user.id),
				user2: Number(sessionStorage.getItem("currentUserID")),
			}
			const response = await fetch(`${process.env.API_URL}/chat/newDMConversation`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(createDMConversationDto),
			});
	
			if (response.ok) {
				const conversation : Conversation = await response.json();
				let tmp = conversation.name;
				let conversationName;
				const currentUserLogin = sessionStorage.getItem("currentUserLogin");
				if (currentUserLogin)
					conversationName = tmp.replace(currentUserLogin, '');
				chatDispatch({ type: 'SET_CURRENT_CONVERSATION', payload: conversationName });
				chatDispatch({ type: 'SET_CURRENT_ROOM', payload: conversation.name });
				chatDispatch({ type: 'SET_CURRENT_CONVERSATION_ID', payload: conversation.id });
				globalState.userSocket?.emit('joinRoom', { roomName: conversation.name, roomID: conversation.id } );
				globalState.userSocket?.emit('addUserToRoom', {
					convID: conversation.id,
					convName: conversation.name,
					friend: user.id,
				});
				globalState.userSocket?.emit('refreshUser', {
					userToRefresh: user.id,
					target: 'refreshDmList',
					status: true
				});
			}
			else {
				const error = await response.json();
				if (Array.isArray(error.message))
					toast.warn(error.message[0]);
				else
					toast.warn(error.message);
			}
		}
		catch (error) {
			console.log(error);
		}
		chatDispatch({ type: 'DISABLE', payload: 'showOptionsUserChannel' });
		chatDispatch({ type: 'DISABLE', payload: 'currentChannelBool' });
		chatDispatch({ type: 'DISABLE', payload: 'showFriendsList' });
		chatDispatch({ type: 'ACTIVATE', payload: 'showChat' });
		chatDispatch({ type: 'ACTIVATE', payload: 'showBackComponent' });

	}

	const blockUser = async () => {

		try {

			const BlockUserDto = {
				recipientID: user.id,
			}

			const response = await fetch(`${process.env.API_URL}/users/blockUser`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(BlockUserDto),
			});

			if (response.ok) {
				const userToBlock = await response.json();
				user.isBlocked = true;
				chatDispatch({ type: 'DISABLE', payload: 'showConfirmation' })
				if (userToBlock)
					globalState.userSocket?.emit('joinRoom', { roomName: `whoblocked${userToBlock}`, roomID: '' });
			}
			else {
				const error = await response.json();
				if (Array.isArray(error.message))
					toast.warn(error.message[0]);
				else
					toast.warn(error.message);
			}
		}
		catch (error) {
			console.error(error);
		}
	}

	const unblockUser = async () => {

		try {
			const BlockUserDto = {
				recipientID: user.id,
			}
			const response = await fetch(`${process.env.API_URL}/users/unblockUser`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(BlockUserDto),
			});

			if (response.ok) {
				user.isBlocked = false;
				const userToUnblock = await response.json();
				if (userToUnblock)
					globalState.userSocket?.emit('leaveRoom', { roomName: `whoblocked${userToUnblock}`, roomID: '' });
				chatDispatch({ type: 'DISABLE', payload: 'showConfirmation' })
			}
			else {
				const error = await response.json();
				if (Array.isArray(error.message))
					toast.warn(error.message[0]);
				else
					toast.warn(error.message);
			}
		}
		catch (error) {
			console.error(error);
		}
	}

	const handleTabClick = (text: string, functionToExecute: any) => {
		setConfirmationText(text);
		setFunctionToExecute(() => functionToExecute);
		chatDispatch({ type: 'ACTIVATE', payload: 'showConfirmation' });
	};
 
	const handleGameInvite = () => {
		globalState.userSocket?.emit('InviteToGame', user.id);
	}

	const removeFriends = async () => {

		try {
			const removeFriendDto = {
				friendID: user.id,
			}

			const response = await fetch(`${process.env.API_URL}/users/deleteFriendRequest`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`
				},
				body: JSON.stringify(removeFriendDto),
			})

			if (response.ok) {
				chatDispatch({ type: 'TOGGLEX', payload: 'refreshFriendsList' });
				chatDispatch({ type: 'DISABLE', payload: 'showConfirmation' });

				globalState.userSocket?.emit('refreshUser', {
					userToRefresh: user.id,
					target: 'refreshFriends',
					status: true,
				});

			}
			else {
				const error = await response.json();
				if (Array.isArray(error.message))
					toast.warn(error.message[0]);
				else
					toast.warn(error.message);
			}
		}
		catch (error) {
			console.error(error);
		}
	}

	const handlFriendRequest = async (user: string) => {
		try {

			const friendRequestDto = {
				recipientLogin: user,
			};

			const response = await fetch(`${process.env.API_URL}/users/addfriend`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(friendRequestDto),
			});

			if (response.ok) {
				
				const data = await response.json();
				if (!data) {
					return;
				}
				
				chatDispatch({ type: 'TOGGLEX', payload: 'refreshFriendsList' });
				chatDispatch({ type: 'DISABLE', payload: 'showAddChannel' });
				chatDispatch({ type: 'DISABLE', payload: 'showAddUser' });
				chatDispatch({ type: 'DISABLE', payload: 'showAddFriend' });

				if (globalState.userSocket?.connected) {
					globalState.userSocket?.emit('joinRoom', { roomName: data.name, roomID: data.id });
					globalState.userSocket?.emit('addFriend',  { recipientLogin: friendRequestDto.recipientLogin } );
				}
			} else {
				const error = await response.json();
				if (Array.isArray(error.message))
					toast.warn(error.message[0]);
				else
					toast.warn(error.message);
			}
		} catch (error) {
			console.log(error);
		}
	};

	
	const handleStats = () => {
		chatDispatch({ type: 'ACTIVATE', payload: 'showStatistiques' });
		chatDispatch({ type: 'DISABLE', payload: 'showBackComponent' });
		chatDispatch({ type: 'SET_CURRENT_TARGET_STATS',  });
	}
	return (
		<>
			<div className="bloc-tab">
				<div className='bloc-tab-img1'  onClick={() => handleTabClick(`Êtes vous sur de vouloir défier ${user.username.toUpperCase()} ?`, handleGameInvite)}>
					<img className='image-tab' src="ping-pong.png"/>
				</div>
				<div className='bloc-tab-img' onClick={handleDms}>
					<img className='image-tab' src="bulle.png" />
				</div>
				{all &&
					<div className='bloc-tab-img' onClick={() => handleTabClick(`Êtes vous sur de vouloir ajouter ${user.username.toUpperCase()} à de votre liste d'amies ?`, () => handlFriendRequest(user.username))}>
						<img className='image-tab' src="ajouter-un-ami.png"  />
					</div>
				}
				<div className='bloc-tab-img'  onClick={() => chatDispatch({ type: 'ACTIVATE', payload: 'showListChannelAdd' })}>
					<img className='image-tab' src="ajouter-un-group.png" />
				</div>
				<div className='bloc-tab-img'  onClick={handleStats} >
					<img className='image-tab' src="tableau-statistique1.png"/>
				</div>
				{!all ? (
					user.isBlocked ? (
						<div className='bloc-tab-img' onClick={() => handleTabClick(`Êtes vous sur de vouloir débloquer ${user.username.toUpperCase()} ?`, unblockUser)}>
							<img className='image-tab' src="bloquer-un-utilisateur1.png" />
						</div>
					) : (
						<div className='bloc-tab-img' onClick={() => handleTabClick(`Êtes vous sur de vouloir bloquer ${user.username.toUpperCase()} ?`, blockUser)}>
							<img className='image-tab-opacity' src="bloquer-un-utilisateur1.png" />
						</div>
					)
				) : (
					user.isBlocked ? (
						<div className='bloc-tab-img8' onClick={() => handleTabClick(`Êtes vous sur de vouloir débloquer ${user.username.toUpperCase()} ?`, unblockUser)}>
							<img className='image-tab' src="bloquer-un-utilisateur1.png" />
						</div>
					) : (
						<div className='bloc-tab-img8' onClick={() => handleTabClick(`Êtes vous sur de vouloir bloquer ${user.username.toUpperCase()} ?`, blockUser)}>
							<img className='image-tab-opacity' src="bloquer-un-utilisateur1.png" />
						</div>
					)
				)}
				{!all &&
					<div className='bloc-tab-img8' onClick={() => handleTabClick(`Êtes vous sur de vouloir supprimer de votre liste d'amies ${user.username.toUpperCase()} ?`, removeFriends)}>
						<img className='image-tab' src="corbeille1.png"  />
					</div>
				}
			</div>
			{chatState.showConfirmation && (
				<ConfirmationComponent phrase={confirmationText} functionToExecute={funtionToExecute} />
			)}
			{chatState.showListChannelAdd && (
				<ListMyChannelComponent user={user.username} friendID={user.id} isAdd={false} title={`INVITE ${user.username.toUpperCase()} TO MY CHANNEL`} />
			)}
		</>
	);
}

export default FriendsListTabComponent;